'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleReaction } from '@/lib/actions/reactions'
import { repost } from '@/lib/actions/posts'

interface PostActionsProps {
  postId: string
  reactionCount: number
  commentCount: number
  viewerReaction: string | null
  authorId: string
  currentUserId: string
}

type ActionState = {
  reactionCount: number
  viewerReaction: string | null
}

export default function PostActions({
  postId,
  reactionCount,
  commentCount,
  viewerReaction,
  authorId,
  currentUserId,
}: PostActionsProps) {
  const [optimistic, setOptimistic] = useOptimistic<ActionState>({
    reactionCount,
    viewerReaction,
  })

  const [reactionPending, startReactionTransition] = useTransition()
  const [repostPending, startRepostTransition] = useTransition()

  const buttonBase = 'flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-40'

  function handleReaction() {
    startReactionTransition(async () => {
      setOptimistic((prev) =>
        prev.viewerReaction
          ? { reactionCount: prev.reactionCount - 1, viewerReaction: null }
          : { reactionCount: prev.reactionCount + 1, viewerReaction: 'heart' }
      )
      await toggleReaction(postId, 'heart')
    })
  }

  function handleRepost() {
    startRepostTransition(async () => {
      await repost(postId)
    })
  }

  return (
    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
      <button
        onClick={handleReaction}
        disabled={reactionPending}
        className={`${buttonBase}${optimistic.viewerReaction ? ' text-red-500 dark:text-red-400' : ''}`}
      >
        {optimistic.viewerReaction ? '❤️' : '🤍'} {optimistic.reactionCount}
      </button>

      <a href={`/post/${postId}`} className={buttonBase}>
        💬 {commentCount}
      </a>

      {authorId !== currentUserId && (
        <button
          onClick={handleRepost}
          disabled={repostPending}
          className={buttonBase}
        >
          {repostPending ? '↻ Reposting…' : '↻ Repost'}
        </button>
      )}
    </div>
  )
}
