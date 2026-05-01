import { Comment } from '@/lib/queries/post'
import DeleteCommentButton from './DeleteCommentButton'

export default function CommentList({
  comments,
  currentUserId,
  postId,
}: {
  comments: Comment[]
  currentUserId: string
  postId: string
}) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
        No comments yet.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const initials = (comment.author.display_name ?? comment.author.username)
          .charAt(0)
          .toUpperCase()

        return (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200 dark:bg-gray-700">
              {comment.author.avatar_url ? (
                <img
                  src={comment.author.avatar_url}
                  alt={comment.author.display_name ?? comment.author.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {initials}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {comment.author.display_name ?? comment.author.username}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
                {comment.author_id === currentUserId && (
                  <DeleteCommentButton commentId={comment.id} postId={postId} />
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                {comment.content}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
