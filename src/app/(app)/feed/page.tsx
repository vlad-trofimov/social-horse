import { createClient } from '@/lib/supabase/server'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username')
    .eq('id', user!.id)
    .single()

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <p className="text-gray-900 dark:text-white font-medium">
          Welcome, {profile?.display_name ?? profile?.username} 👋
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your feed is empty for now — posts and connections coming in Phase 2.
        </p>
      </div>
    </div>
  )
}
