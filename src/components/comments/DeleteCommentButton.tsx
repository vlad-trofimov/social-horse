'use client'

import { useTransition } from 'react'
import { deleteComment } from '@/lib/actions/comments'

export default function DeleteCommentButton({ commentId, postId }: { commentId: string; postId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this comment?')) return
    startTransition(() => deleteComment(commentId, postId))
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-40 transition-colors"
    >
      {isPending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
