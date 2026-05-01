'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(
  displayName: string,
  bio: string,
  avatarUrl: string | null,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  await supabase
    .from('profiles')
    .update({
      display_name: displayName.trim(),
      bio: bio.trim(),
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq('id', user!.id)

  revalidatePath('/profile')
}
