import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileEditForm from '@/components/profile/ProfileEditForm'

export default async function EditProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, bio, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/feed')

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h1>
      <ProfileEditForm
        userId={user.id}
        initialDisplayName={profile.display_name ?? ''}
        initialBio={profile.bio ?? ''}
        initialAvatarUrl={profile.avatar_url ?? null}
      />
    </div>
  )
}
