import { useEffect, type ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  // Max width preset; default keeps forms comfortable.
  maxWidth?: 'sm' | 'md' | 'lg'
}

const widthClass: Record<NonNullable<Props['maxWidth']>, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[520px]',
  lg: 'max-w-[640px]',
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = 'md',
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${widthClass[maxWidth]} max-h-[calc(100vh-2rem)] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-semibold text-[#0C0310]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="w-8 h-8 rounded-full text-[#3C3C3C] hover:bg-[#F0F0F0] flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="px-5 pb-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
