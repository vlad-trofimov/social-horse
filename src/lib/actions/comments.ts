'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function addComment(postId: string, content: string) {
  const schema = z.object({
    postId: z.string().uuid(),
    content: z.string().min(1).max(500),
  })

  const result = schema.safeParse({ postId, content })
  if (!result.success) return

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('comments')
    .insert({ post_id: result.data.postId, author_id: user.id, content: result.data.content.trim() })

  revalidatePath('/post/' + postId)
}

export async function deleteComment(commentId: string, postId: string) {
  const schema = z.object({
    commentId: z.string().uuid(),
    postId: z.string().uuid(),
  })

  const result = schema.safeParse({ commentId, postId })
  if (!result.success) return

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('comments')
    .delete()
    .eq('id', result.data.commentId)
    .eq('author_id', user.id)

  revalidatePath('/post/' + result.data.postId)
}
