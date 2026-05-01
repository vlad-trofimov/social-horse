import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; token_hash?: string; type?: string }>
}) {
  const params = await searchParams
  if (params.code || params.token_hash) {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    redirect(`/auth/callback?${qs}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="text-center max-w-sm px-4">
        <div className="text-6xl mb-4">🐴</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Horse Social</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Share the ride. Connect the herd.</p>
        <div className="flex flex-col gap-3">
          <a
            href="/register"
            className="w-full py-2.5 px-4 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-center"
          >
            Create account
          </a>
          <a
            href="/login"
            className="w-full py-2.5 px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}
