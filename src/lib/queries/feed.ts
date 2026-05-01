import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const PAGE_SIZE = 20

export type OriginalPost = {
  id: string
  content: string | null
  image_url: string | null
  embed_url: string | null
  created_at: string
  author: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

export type FeedPost = {
  id: string
  author_id: string
  content: string | null
  image_url: string | null
  embed_url: string | null
  repost_of: string | null
  created_at: string
  author: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  original_post: OriginalPost | null
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

async function fetchOriginalPosts(
  supabase: SupabaseClient<Database>,
  originalIds: string[],
): Promise<Map<string, OriginalPost>> {
  if (originalIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, content, image_url, embed_url, created_at, author:profiles!posts_author_id_fkey(username, display_name, avatar_url)',
    )
    .in('id', originalIds)

  if (error) throw error

  const map = new Map<string, OriginalPost>()
  for (const row of data ?? []) {
    const author = Array.isArray(row.author) ? row.author[0] : row.author
    map.set(row.id, {
      id: row.id,
      content: row.content,
      image_url: row.image_url,
      embed_url: row.embed_url ?? null,
      created_at: row.created_at,
      author: {
        username: author?.username ?? '',
        display_name: author?.display_name ?? null,
        avatar_url: author?.avatar_url ?? null,
      },
    })
  }
  return map
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
      `id, author_id, content, image_url, embed_url, repost_of, created_at,
       author:profiles!posts_author_id_fkey(username, display_name, avatar_url)`,
    )
    .in('author_id', authorIds)
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

  if (postsError) throw postsError
  if (!posts || posts.length === 0) return []

  const postIds = posts.map((p) => p.id)
  const originalIds = [...new Set(posts.map((p) => p.repost_of).filter(Boolean) as string[])]

  const [reactionsRes, commentsRes, viewerReactionsRes, originalPostsMap] = await Promise.all([
    supabase.from('reactions').select('post_id').in('post_id', postIds),
    supabase.from('comments').select('post_id').in('post_id', postIds),
    supabase
      .from('reactions')
      .select('post_id, type')
      .in('post_id', postIds)
      .eq('user_id', userId),
    fetchOriginalPosts(supabase, originalIds),
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

  const viewerReactions = (viewerReactionsRes.data ?? []).reduce<Record<string, string>>(
    (acc, r) => {
      acc[r.post_id] = r.type
      return acc
    },
    {},
  )

  return posts.map((post) => {
    const author = Array.isArray(post.author) ? post.author[0] : post.author
    return {
      id: post.id,
      author_id: post.author_id,
      content: post.content,
      image_url: post.image_url,
      embed_url: post.embed_url ?? null,
      repost_of: post.repost_of,
      created_at: post.created_at,
      author: {
        username: author?.username ?? '',
        display_name: author?.display_name ?? null,
        avatar_url: author?.avatar_url ?? null,
      },
      original_post: post.repost_of ? (originalPostsMap.get(post.repost_of) ?? null) : null,
      reaction_count: reactionCounts[post.id] ?? 0,
      comment_count: commentCounts[post.id] ?? 0,
      viewer_reaction: viewerReactions[post.id] ?? null,
    }
  })
}
