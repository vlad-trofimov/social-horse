import { getFeedPosts } from '@/lib/queries/feed'
import PostCard from './PostCard'

interface FeedContainerProps {
  userId: string
}

export default async function FeedContainer({ userId }: FeedContainerProps) {
  const posts = await getFeedPosts(userId)

  if (posts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No posts yet.</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Connect with others to see their posts here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={userId} />
      ))}
    </div>
  )
}
