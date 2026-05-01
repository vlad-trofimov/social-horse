'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  className?: string
}

export default function SearchBar({ className }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault()
        router.push('/search?q=' + encodeURIComponent(query))
      }}
    >
      <input
        type="search"
        placeholder="Search people…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-1.5 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all sm:w-48 sm:focus:w-64"
      />
    </form>
  )
}
