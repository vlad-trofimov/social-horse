'use client'

import { acceptFriendRequest, declineFriendRequest } from '@/lib/actions/connections'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

function FriendRequestActions({ requesterId }: { requesterId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleAccept() {
    startTransition(async () => {
      await acceptFriendRequest(requesterId)
      router.refresh()
    })
  }

  function handleDecline() {
    startTransition(async () => {
      await declineFriendRequest(requesterId)
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleAccept}
        disabled={isPending}
        className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        Accept
      </button>
      <button
        onClick={handleDecline}
        disabled={isPending}
        className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        Decline
      </button>
    </div>
  )
}

type FriendRequest = {
  requester_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export default function FriendRequestsList({ requests }: { requests: FriendRequest[] }) {
  if (requests.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Friend Requests</h2>
      <ul className="space-y-3">
        {requests.map((requester) => (
          <li key={requester.requester_id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {requester.avatar_url ? (
                <img
                  src={requester.avatar_url}
                  alt={requester.display_name ?? requester.username}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full shrink-0 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                    {(requester.display_name ?? requester.username).charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {requester.display_name ?? requester.username}
              </span>
            </div>
            <FriendRequestActions requesterId={requester.requester_id} />
          </li>
        ))}
      </ul>
    </div>
  )
}
