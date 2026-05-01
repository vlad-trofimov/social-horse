import Link from 'next/link'
import type { FeedPost } from '@/lib/queries/feed'
import RepostBadge from './RepostBadge'
import DeletePostButton from './DeletePostButton'
import PostActions from './PostActions'
import ImageModal from '@/components/ui/ImageModal'
import EmbedPlayer from '@/components/ui/EmbedPlayer'

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
        <RepostBadge reposterName={post.author.display_name ?? post.author.username} />
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

      {!post.repost_of && post.content && post.content !== '' && (
        <Link href={`/post/${post.id}`} className="block group">
          <p className="mt-3 text-sm text-gray-900 dark:text-white whitespace-pre-wrap group-hover:opacity-80 transition-opacity">
            {post.content}
          </p>
        </Link>
      )}

      {!post.repost_of && post.image_url && (
        <ImageModal src={post.image_url} />
      )}

      {!post.repost_of && post.embed_url && (
        <EmbedPlayer src={post.embed_url} />
      )}

      {post.original_post && (
        <Link href={`/post/${post.original_post.id}`} className="block mt-3 group">
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800 group-hover:bg-gray-100 dark:group-hover:bg-gray-750 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              {post.original_post.author.avatar_url ? (
                <img
                  src={post.original_post.author.avatar_url}
                  alt={post.original_post.author.display_name ?? post.original_post.author.username}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                  {(post.original_post.author.display_name ?? post.original_post.author.username).charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {post.original_post.author.display_name ?? post.original_post.author.username}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                @{post.original_post.author.username}
              </span>
            </div>
            {post.original_post.content && post.original_post.content !== '' && (
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {post.original_post.content}
              </p>
            )}
            {post.original_post.image_url && (
              <img
                src={post.original_post.image_url}
                alt="Original post image"
                className="mt-2 rounded-lg max-h-48 object-cover w-full"
              />
            )}
          </div>
        </Link>
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
