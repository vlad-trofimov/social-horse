'use client'

import { useOptimistic, useTransition } from 'react'
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from '@/lib/actions/connections'

export type ConnectionStatus =
  | 'none'
  | 'pending_sent'
  | 'pending_received'
  | 'accepted'
  | 'declined'

interface FriendButtonProps {
  targetUserId: string
  initialStatus: ConnectionStatus
}

const primary =
  'px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-full hover:opacity-80 transition-opacity'
const secondary =
  'px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full hover:opacity-80 transition-opacity'

export default function FriendButton({ targetUserId, initialStatus }: FriendButtonProps) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(initialStatus)
  const [, startTransition] = useTransition()

  function run(next: ConnectionStatus, action: () => Promise<unknown>) {
    startTransition(async () => {
      setOptimisticStatus(next)
      await action()
    })
  }

  if (optimisticStatus === 'none' || optimisticStatus === 'declined') {
    return (
      <button
        className={primary}
        onClick={() => run('pending_sent', () => sendFriendRequest(targetUserId))}
      >
        Add Friend
      </button>
    )
  }

  if (optimisticStatus === 'pending_sent') {
    return (
      <button
        className={secondary}
        onClick={() => run('none', () => removeFriend(targetUserId))}
      >
        Pending
      </button>
    )
  }

  if (optimisticStatus === 'pending_received') {
    return (
      <div className="flex gap-2">
        <button
          className={primary}
          onClick={() => run('accepted', () => acceptFriendRequest(targetUserId))}
        >
          Accept
        </button>
        <button
          className={secondary}
          onClick={() => run('declined', () => declineFriendRequest(targetUserId))}
        >
          Decline
        </button>
      </div>
    )
  }

  return (
    <button
      className={secondary}
      onClick={() => run('none', () => removeFriend(targetUserId))}
    >
      Friends ✓
    </button>
  )
}
