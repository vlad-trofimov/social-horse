'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export default function ImageModal({ src, alt }: { src: string; alt?: string }) {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close])

  return (
    <>
      <img
        src={src}
        alt={alt ?? ''}
        onClick={(e) => { e.preventDefault(); setOpen(true) }}
        className="mt-3 rounded-xl w-full object-cover max-h-96 cursor-zoom-in"
      />

      {open && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
          <img
            src={src}
            alt={alt ?? ''}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>,
        document.body
      )}
    </>
  )
}
