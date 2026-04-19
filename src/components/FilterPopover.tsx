import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  anchor?: 'right' | 'left'
}

/**
 * Lightweight popover. Closes on outside click and Escape.
 */
export default function FilterPopover({
  open,
  onClose,
  title,
  children,
  anchor = 'right',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  if (!open) return null

  const position = anchor === 'right' ? 'right-0' : 'left-0'

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      className={
        'absolute top-full mt-2 ' +
        position +
        ' z-20 w-[320px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-[#F0F0F0] p-4'
      }
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-[#0C0310]">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="text-[#8C8C8C] hover:text-[#0C0310]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {children}
    </div>
  )
}
