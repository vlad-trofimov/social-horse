import { register } from '@/lib/actions/auth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import SubmitButton from '@/components/ui/SubmitButton'

// Letters (including accented), hyphens, apostrophes, spaces
const NAME_PATTERN = "[a-zA-ZÀ-ÖØ-öø-ÿ'\\- ]+"

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Join Horse Social today</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form action={register} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="first_name">
                First name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                pattern={NAME_PATTERN}
                title="Letters, hyphens, and apostrophes only"
                className={inputClass}
                placeholder="Anne"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="last_name">
                Last name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                pattern={NAME_PATTERN}
                title="Letters, hyphens, and apostrophes only"
                className={inputClass}
                placeholder="O'Brien"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className={inputClass}
              placeholder="Min. 6 characters"
            />
          </div>

          <SubmitButton
            label="Create account"
            pendingLabel="Creating account…"
            className="w-full py-2 px-4 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
          />
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-black dark:text-white hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
