import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          We sent a confirmation link to your email address. Click it to activate your account.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Didn&apos;t receive it? Check your spam folder, or{' '}
          <a href="/register" className="text-black dark:text-white font-medium hover:underline">
            try again
          </a>
          .
        </p>
      </div>
    </div>
  )
}
