import { createClient } from '@/lib/supabase/server'
import {
  getProfileByUsername,
  getConnectionStatus,
  getUserPosts,
  getPendingFriendRequests,
} from '@/lib/queries/profile'
import ProfileHeader from '@/components/profile/ProfileHeader'
import FriendRequestsList from '@/components/profile/FriendRequestsList'
import PostCard from '@/components/feed/PostCard'
import type { ConnectionStatus } from '@/components/profile/FriendButton'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const supabase = await createClient()
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const profile = await getProfileByUsername(username)

  if (!profile) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">This profile doesn&apos;t exist.</p>
      </div>
    )
  }

  const isOwnProfile = profile.id === currentUser!.id

  const connectionStatus: ConnectionStatus = isOwnProfile
    ? 'accepted'
    : await getConnectionStatus(currentUser!.id, profile.id)

  const posts = await getUserPosts(profile.id, currentUser!.id)

  const pendingRequests = isOwnProfile ? await getPendingFriendRequests(profile.id) : []

  const canSeePosts = isOwnProfile || connectionStatus === 'accepted'

  return (
    <div className="space-y-6">
      {isOwnProfile && <FriendRequestsList requests={pendingRequests} />}
      <ProfileHeader
        profile={profile}
        connectionStatus={connectionStatus}
        currentUserId={currentUser!.id}
        isOwnProfile={isOwnProfile}
      />
      {canSeePosts ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUser!.id} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add {profile.display_name ?? profile.username} as a friend to see their posts.
          </p>
        </div>
      )}
    </div>
  )
}
