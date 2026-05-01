'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function sendFriendRequest(addresseeId: string) {
  if (!z.string().uuid().safeParse(addresseeId).success) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase
    .from('connections')
    .upsert(
      { requester_id: user!.id, addressee_id: addresseeId, status: 'pending' },
      { onConflict: 'requester_id,addressee_id', ignoreDuplicates: true }
    )

  revalidatePath('/profile')
}

export async function acceptFriendRequest(requesterId: string) {
  if (!z.string().uuid().safeParse(requesterId).success) return

  const supabase = await createClient()

  await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('requester_id', requesterId)
    .eq('status', 'pending')

  revalidatePath('/profile')
}

export async function declineFriendRequest(requesterId: string) {
  if (!z.string().uuid().safeParse(requesterId).success) return

  const supabase = await createClient()

  await supabase
    .from('connections')
    .update({ status: 'declined' })
    .eq('requester_id', requesterId)
    .eq('status', 'pending')

  revalidatePath('/profile')
}

export async function removeFriend(otherUserId: string) {
  if (!z.string().uuid().safeParse(otherUserId).success) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase
    .from('connections')
    .delete()
    .eq('requester_id', user!.id)
    .eq('addressee_id', otherUserId)

  await supabase
    .from('connections')
    .delete()
    .eq('requester_id', otherUserId)
    .eq('addressee_id', user!.id)

  revalidatePath('/profile')
}
