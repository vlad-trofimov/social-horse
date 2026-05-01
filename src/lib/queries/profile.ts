import { createClient } from '@/lib/supabase/server'
import type { FeedPost } from './feed'

export async function getProfileByUsername(username: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .eq('username', username)
    .single()
  return data ?? null
}

export async function getConnectionStatus(
  currentUserId: string,
  targetUserId: string,
): Promise<'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined'> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('connections')
    .select('requester_id, addressee_id, status')
    .or(
      `and(requester_id.eq.${currentUserId},addressee_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},addressee_id.eq.${currentUserId})`,
    )
    .maybeSingle()

  if (!data) return 'none'
  if (data.status === 'accepted') return 'accepted'
  if (data.status === 'declined') return 'declined'
  if (data.requester_id === currentUserId) return 'pending_sent'
  return 'pending_received'
}

export async function getUserPosts(profileId: string, viewerId: string): Promise<FeedPost[]> {
  const supabase = await createClient()

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select(
      `id, author_id, content, image_url, repost_of, created_at,
       author:profiles!posts_author_id_fkey(username, display_name, avatar_url)`,
    )
    .eq('author_id', profileId)
    .order('created_at', { ascending: false })
    .limit(50)

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
      .eq('user_id', viewerId),
  ])

  if (reactionsRes.error) throw reactionsRes.error
  if (commentsRes.error) throw commentsRes.error
  if (viewerReactionsRes.error) throw viewerReactionsRes.error

  const reactionCounts = (reactionsRes.data ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.post_id] = (acc[r.post_id] ?? 0) + 1
    return acc
  }, {})

  const commentCounts = (commentsRes.data ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.post_id] = (acc[c.post_id] ?? 0) + 1
    return acc
  }, {})

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

export async function getPendingFriendRequests(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('connections')
    .select(
      'requester_id, requester:profiles!connections_requester_id_fkey(username, display_name, avatar_url)',
    )
    .eq('addressee_id', userId)
    .eq('status', 'pending')

  return (data ?? []).map((row) => {
    const requester = Array.isArray(row.requester) ? row.requester[0] : row.requester
    return {
      requester_id: row.requester_id,
      username: requester?.username ?? '',
      display_name: requester?.display_name ?? null,
      avatar_url: requester?.avatar_url ?? null,
    }
  })
}
