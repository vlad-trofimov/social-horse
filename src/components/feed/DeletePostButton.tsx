'use client'

import { useTransition } from 'react'
import { deletePost } from '@/lib/actions/posts'

export default function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this post?')) return
    startTransition(() => deletePost(postId))
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
