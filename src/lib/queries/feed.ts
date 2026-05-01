import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const PAGE_SIZE = 20

export type FeedPost = {
  id: string
  author_id: string
  content: string | null
  image_url: string | null
  repost_of: string | null
  created_at: string
  author: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  reaction_count: number
  comment_count: number
  viewer_reaction: string | null
}

async function getFriendIds(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string[]> {
  const [sentRes, receivedRes] = await Promise.all([
    supabase
      .from('connections')
      .select('addressee_id')
      .eq('requester_id', userId)
      .eq('status', 'accepted'),
    supabase
      .from('connections')
      .select('requester_id')
      .eq('addressee_id', userId)
      .eq('status', 'accepted'),
  ])

  const sent = (sentRes.data ?? []).map((r) => r.addressee_id)
  const received = (receivedRes.data ?? []).map((r) => r.requester_id)

  return [...new Set([...sent, ...received])]
}

export async function getFeedPosts(
  userId: string,
  page = 0,
): Promise<FeedPost[]> {
  const supabase = await createClient()

  const friendIds = await getFriendIds(supabase, userId)
  const authorIds = [...new Set([...friendIds, userId])]

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(
      `id, author_id, content, image_url, repost_of, created_at,
       author:profiles!posts_author_id_fkey(username, display_name, avatar_url)`,
    )
    .in('author_id', authorIds)
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

  if (postsError) throw postsError
  if (!posts || posts.length === 0) return []

  const postIds = posts.map((p) => p.id)

  const [reactionsRes, commentsRes, viewerReactionsRes] = await Promise.all([
    supabase.from('reactions').select('post_id').in('post_id', postIds),
    supabase.from('comments').select('post_id').in('post_id', postIds),
    supabase
      .from('reactions')
      .select('post_id, type')
      .in('post_id', postIds)
      .eq('user_id', userId),
  ])

  if (reactionsRes.error) throw reactionsRes.error
  if (commentsRes.error) throw commentsRes.error
  if (viewerReactionsRes.error) throw viewerReactionsRes.error

  const reactionCounts = (reactionsRes.data ?? []).reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.post_id] = (acc[r.post_id] ?? 0) + 1
      return acc
    },
    {},
  )

  const commentCounts = (commentsRes.data ?? []).reduce<Record<string, number>>(
    (acc, c) => {
      acc[c.post_id] = (acc[c.post_id] ?? 0) + 1
      return acc
    },
    {},
  )

  // One row per post at most (PK is post_id, user_id)
  const viewerReactions = (viewerReactionsRes.data ?? []).reduce<
    Record<string, string>
  >((acc, r) => {
    acc[r.post_id] = r.type
    return acc
  }, {})

  return posts.map((post) => {
    const author = Array.isArray(post.author) ? post.author[0] : post.author
    return {
      id: post.id,
      author_id: post.author_id,
      content: post.content,
      image_url: post.image_url,
      repost_of: post.repost_of,
      created_at: post.created_at,
      author: {
        username: author?.username ?? '',
        display_name: author?.display_name ?? null,
        avatar_url: author?.avatar_url ?? null,
      },
      reaction_count: reactionCounts[post.id] ?? 0,
      comment_count: commentCounts[post.id] ?? 0,
      viewer_reaction: viewerReactions[post.id] ?? null,
    }
  })
}
