'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  return (
    <form
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
        className="w-48 px-3 py-1.5 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all focus:w-64"
      />
    </form>
  )
}
