import FriendButton from './FriendButton'
import type { ConnectionStatus } from './FriendButton'

export type ProfileData = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

interface ProfileHeaderProps {
  profile: ProfileData
  connectionStatus: ConnectionStatus
  currentUserId: string
  isOwnProfile: boolean
}

export default function ProfileHeader({
  profile,
  connectionStatus,
  isOwnProfile,
}: ProfileHeaderProps) {
  const label = profile.display_name ?? profile.username
  const avatarLetter = label.charAt(0).toUpperCase()

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center gap-4">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={label}
            className="w-20 h-20 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-medium text-gray-600 dark:text-gray-300 shrink-0">
            {avatarLetter}
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <span className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {label}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm truncate">
            @{profile.username}
          </span>
          {!isOwnProfile && (
            <div className="mt-2">
              <FriendButton targetUserId={profile.id} initialStatus={connectionStatus} />
            </div>
          )}
        </div>
      </div>

      {profile.bio && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{profile.bio}</p>
      )}

      {isOwnProfile && (
        <a
          href="/profile/edit"
          className="mt-3 inline-block text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          Edit profile
        </a>
      )}
    </div>
  )
}
