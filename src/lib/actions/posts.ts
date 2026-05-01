'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createPost(content: string | null, imageUrl: string | null) {
  const trimmed = content?.trim() || null

  if (!trimmed && !imageUrl) {
    return
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('posts').insert({
    author_id: user!.id,
    content: trimmed || null,
    image_url: imageUrl || null,
  })

  revalidatePath('/feed')
}

export async function repost(originalPostId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('posts').insert({
    author_id: user!.id,
    repost_of: originalPostId,
    content: '',
    image_url: null,
  })

  revalidatePath('/feed')
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user!.id)

  revalidatePath('/feed')
}
