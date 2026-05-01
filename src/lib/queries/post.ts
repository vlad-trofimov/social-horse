import { createClient } from '@/lib/supabase/server'
import type { FeedPost, OriginalPost } from './feed'

export type Comment = {
  id: string
  author_id: string
  content: string
  created_at: string
  author: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

export type PostWithComments = FeedPost & {
  comments: Comment[]
}

export async function getPostWithComments(
  postId: string,
  viewerId: string,
): Promise<PostWithComments | null> {
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select(
      `id, author_id, content, image_url, embed_url, repost_of, created_at,
       author:profiles!posts_author_id_fkey(username, display_name, avatar_url)`,
    )
    .eq('id', postId)
    .maybeSingle()

  if (!post) return null

  const [reactionsRes, commentsRes, viewerReactionRes, originalPostRes] = await Promise.all([
    supabase.from('reactions').select('post_id').eq('post_id', postId),
    supabase
      .from('comments')
      .select(
        'id, author_id, content, created_at, author:profiles!comments_author_id_fkey(username, display_name, avatar_url)',
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: true }),
    supabase
      .from('reactions')
      .select('type')
      .eq('post_id', postId)
      .eq('user_id', viewerId)
      .maybeSingle(),
    post.repost_of
      ? supabase
          .from('posts')
          .select(
            'id, content, image_url, embed_url, created_at, author:profiles!posts_author_id_fkey(username, display_name, avatar_url)',
          )
          .eq('id', post.repost_of)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  const reactionCount = (reactionsRes.data ?? []).length

  const comments: Comment[] = (commentsRes.data ?? []).map((row) => {
    const author = Array.isArray(row.author) ? row.author[0] : row.author
    return {
      id: row.id,
      author_id: row.author_id,
      content: row.content,
      created_at: row.created_at,
      author: {
        username: author?.username ?? '',
        display_name: author?.display_name ?? null,
        avatar_url: author?.avatar_url ?? null,
      },
    }
  })

  const postAuthor = Array.isArray(post.author) ? post.author[0] : post.author
  const rawOriginal = originalPostRes.data
  const originalAuthor = rawOriginal
    ? Array.isArray(rawOriginal.author)
      ? rawOriginal.author[0]
      : rawOriginal.author
    : null

  const original_post: OriginalPost | null = rawOriginal
    ? {
        id: rawOriginal.id,
        content: rawOriginal.content,
        image_url: rawOriginal.image_url,
        embed_url: rawOriginal.embed_url ?? null,
        created_at: rawOriginal.created_at,
        author: {
          username: originalAuthor?.username ?? '',
          display_name: originalAuthor?.display_name ?? null,
          avatar_url: originalAuthor?.avatar_url ?? null,
        },
      }
    : null

  return {
    id: post.id,
    author_id: post.author_id,
    content: post.content,
    image_url: post.image_url,
    embed_url: post.embed_url ?? null,
    repost_of: post.repost_of,
    created_at: post.created_at,
    author: {
      username: postAuthor?.username ?? '',
      display_name: postAuthor?.display_name ?? null,
      avatar_url: postAuthor?.avatar_url ?? null,
    },
    original_post,
    reaction_count: reactionCount,
    comment_count: comments.length,
    viewer_reaction: viewerReactionRes.data?.type ?? null,
    comments,
  }
}
