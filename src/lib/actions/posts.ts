'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { isAllowedEmbedUrl } from '@/lib/embeds'

export async function createPost(
  content: string | null,
  imageUrl: string | null,
  embedUrl: string | null,
) {
  const schema = z
    .object({
      content: z.string().max(1000).nullable(),
      imageUrl: z.string().url().nullable(),
      embedUrl: z
        .string()
        .url()
        .refine(
          (u) => isAllowedEmbedUrl(u),
          { message: 'Unsupported embed source' },
        )
        .nullable(),
    })
    .refine((d) => d.content || d.imageUrl || d.embedUrl, {
      message: 'Post must have content, an image, or an embed',
    })

  const result = schema.safeParse({ content, imageUrl, embedUrl })
  if (!result.success) return

  const trimmed = result.data.content?.trim() || null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('posts').insert({
    author_id: user!.id,
    content: trimmed || null,
    image_url: result.data.imageUrl || null,
    embed_url: result.data.embedUrl || null,
  })

  revalidatePath('/feed')
}

export async function repost(originalPostId: string) {
  if (!z.string().uuid().safeParse(originalPostId).success) return

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
  if (!z.string().uuid().safeParse(postId).success) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user!.id)

  revalidatePath('/feed')
}
