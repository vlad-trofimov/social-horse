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
          <div className="hidden sm:flex flex-1 justify-center px-4">
            <SearchBar />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <a
              href={`/profile/${profile?.username}`}
              className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              My Profile
            </a>
            <form action={logout} className="flex items-center">
              <button
                type="submit"
                title="Sign out"
                className="flex items-center text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
        <div className="sm:hidden px-4 pb-2">
          <SearchBar className="w-full" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
