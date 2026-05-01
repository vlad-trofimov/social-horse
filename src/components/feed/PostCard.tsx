import Link from 'next/link'
import type { FeedPost } from '@/lib/queries/feed'
import RepostBadge from './RepostBadge'
import DeletePostButton from './DeletePostButton'

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
        {post.author.avatar_url ? (
          <img
            src={post.author.avatar_url}
            alt={authorLabel}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300 shrink-0">
            {avatarLetter}
          </div>
        )}

        <div className="flex flex-col min-w-0">
          {post.author.display_name && (
            <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {post.author.display_name}
            </span>
          )}
          <span className="text-gray-500 dark:text-gray-400 text-xs truncate">
            @{post.author.username}
          </span>
        </div>

        <span className="text-gray-400 dark:text-gray-500 text-xs ml-auto shrink-0">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

      {post.content && post.content !== '' && (
        <p className="mt-3 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {post.image_url && (
        <img
          src={post.image_url}
          alt=""
          className="mt-3 rounded-xl w-full object-cover max-h-96"
        />
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span>❤️ {post.reaction_count}</span>
        <span>💬 {post.comment_count}</span>
        <div className="ml-auto flex items-center gap-3">
          {post.author_id === currentUserId && (
            <DeletePostButton postId={post.id} />
          )}
          <Link
            href={`/post/${post.id}`}
            className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            View thread
          </Link>
        </div>
      </div>
    </div>
  )
}
