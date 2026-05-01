'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string

  const namePattern = /^[a-zA-ZÀ-ÖØ-öø-ÿ'\- ]+$/
  if (!namePattern.test(firstName) || !namePattern.test(lastName)) {
    redirect(`/register?error=${encodeURIComponent('Names may only contain letters, hyphens, and apostrophes.')}`)
  }

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
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

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
