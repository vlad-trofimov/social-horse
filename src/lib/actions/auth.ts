'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function register(formData: FormData) {
  const nameRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ'\- ]+$/
  const schema = z.object({
    first_name: z.string().min(1).max(50).regex(nameRegex),
    last_name: z.string().min(1).max(50).regex(nameRegex),
    email: z.string().email(),
    password: z.string().min(6),
  })

  const result = schema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    redirect(`/register?error=${encodeURIComponent(result.error.issues[0].message)}`)
  }

  const supabase = await createClient()

  const { first_name: firstName, last_name: lastName, email, password } = result.data

  const displayName = `${firstName.trim()} ${lastName.trim()}`

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: { display_name: displayName, first_name: firstName.trim(), last_name: lastName.trim() },
    },
  })

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/check-email')
}

export async function login(formData: FormData) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  })

  const result = schema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    redirect(`/login?error=${encodeURIComponent(result.error.issues[0].message)}`)
  }

  const supabase = await createClient()

  const { email, password } = result.data

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/feed')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
