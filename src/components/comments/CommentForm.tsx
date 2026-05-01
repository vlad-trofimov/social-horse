'use client'

import { useState, useTransition } from 'react'
import { addComment } from '@/lib/actions/comments'

export default function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await addComment(postId, content)
      setContent('')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="text"
        placeholder="Write a comment…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
      />
      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
      >
        Post
      </button>
    </form>
  )
}
