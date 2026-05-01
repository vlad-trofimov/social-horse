'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function updateProfile(
  displayName: string,
  bio: string,
  avatarUrl: string | null,
) {
  const schema = z.object({
    displayName: z.string().min(1).max(100),
    bio: z.string().max(300),
    avatarUrl: z.string().url().nullable(),
  })

  const result = schema.safeParse({ displayName, bio, avatarUrl })
  if (!result.success) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  await supabase
    .from('profiles')
    .update({
      display_name: result.data.displayName.trim(),
      bio: result.data.bio.trim(),
      ...(result.data.avatarUrl ? { avatar_url: result.data.avatarUrl } : {}),
    })
    .eq('id', user!.id)

  revalidatePath('/profile')
}
