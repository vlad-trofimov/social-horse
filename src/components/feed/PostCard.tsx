import Link from 'next/link'
import type { FeedPost } from '@/lib/queries/feed'
import RepostBadge from './RepostBadge'
import DeletePostButton from './DeletePostButton'
import PostActions from './PostActions'
import ImageModal from '@/components/ui/ImageModal'

type PostCardProps = {
  post: FeedPost
  currentUserId: string
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const authorLabel = post.author.display_name ?? post.author.username
  const avatarLetter = authorLabel.charAt(0).toUpperCase()

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      {post.repost_of && (
        <RepostBadge originalAuthorName={post.author.display_name ?? post.author.username} />
      )}

      <div className="flex items-center gap-3">
        <Link href={`/profile/${post.author.username}`} className="shrink-0">
          {post.author.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt={authorLabel}
              className="w-9 h-9 rounded-full object-cover hover:opacity-80 transition-opacity"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:opacity-80 transition-opacity">
              {avatarLetter}
            </div>
          )}
        </Link>

        <Link href={`/profile/${post.author.username}`} className="flex flex-col min-w-0 hover:opacity-80 transition-opacity">
          {post.author.display_name && (
            <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {post.author.display_name}
            </span>
          )}
          <span className="text-gray-500 dark:text-gray-400 text-xs truncate">
            @{post.author.username}
          </span>
        </Link>

        <Link
          href={`/post/${post.id}`}
          className="text-gray-400 dark:text-gray-500 text-xs ml-auto shrink-0 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {new Date(post.created_at).toLocaleDateString()}
        </Link>
      </div>

      {post.content && post.content !== '' && (
        <Link href={`/post/${post.id}`} className="block group">
          <p className="mt-3 text-sm text-gray-900 dark:text-white whitespace-pre-wrap group-hover:opacity-80 transition-opacity">
            {post.content}
          </p>
        </Link>
      )}

      {post.image_url && (
        <ImageModal src={post.image_url} />
      )}

      <div className="mt-3 flex items-center justify-between">
        <PostActions
          postId={post.id}
          reactionCount={post.reaction_count}
          commentCount={post.comment_count}
          viewerReaction={post.viewer_reaction}
          authorId={post.author_id}
          currentUserId={currentUserId}
        />
        <div className="ml-auto flex items-center gap-3">
          {post.author_id === currentUserId && (
            <DeletePostButton postId={post.id} />
          )}
        </div>
      </div>
    </div>
  )
}
