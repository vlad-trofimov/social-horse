'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addComment(postId: string, content: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const trimmed = content.trim()
  if (!trimmed) return

  await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: user.id, content: trimmed })

  revalidatePath('/post/' + postId)
}

export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('author_id', user.id)

  revalidatePath('/post/' + postId)
}
