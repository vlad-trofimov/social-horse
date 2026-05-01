import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import SearchBar from '@/components/ui/SearchBar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/feed" className="text-lg font-bold text-gray-900 dark:text-white tracking-tight shrink-0">
            🐴 Horse Social
          </a>
          <div className="flex-1 flex justify-center px-4">
            <SearchBar />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <a
              href={`/profile/${profile?.username}`}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              {profile?.display_name ?? profile?.username ?? 'Profile'}
            </a>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
