import { createClient } from '@/lib/supabase/server'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  if (!q || q.trim() === '') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Search for people by name or username.</p>
      </div>
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
    .limit(20)

  const results = (data ?? []).filter((row) => row.id !== user?.id)

  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">No users found for &ldquo;{q}&rdquo;.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Results for &ldquo;{q}&rdquo;</p>
      <div className="space-y-2">
        {results.map((profile) => (
          <a
            key={profile.id}
            href={`/profile/${profile.username}`}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? profile.username}
                width={40}
                height={40}
                className="rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm font-medium shrink-0">
                {(profile.display_name ?? profile.username ?? '?')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {profile.display_name ?? profile.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{profile.username}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
