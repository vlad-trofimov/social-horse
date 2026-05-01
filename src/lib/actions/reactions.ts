'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleReaction(
  postId: string,
  type: 'like' | 'heart' | 'laugh' | 'wow',
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('reactions')
    .select('type')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) {
    await supabase
      .from('reactions')
      .insert({ post_id: postId, user_id: user.id, type })
  } else if (existing.type === type) {
    await supabase
      .from('reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
  } else {
    await supabase
      .from('reactions')
      .update({ type })
      .eq('post_id', postId)
      .eq('user_id', user.id)
  }

  revalidatePath('/feed')
}
