import { useToastStore } from '../store/toastStore'

export default function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.kind === 'success'
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto min-w-[260px] max-w-[360px] px-4 py-3 rounded-xl shadow-lg text-sm text-white flex items-start gap-3 ${
              isSuccess ? 'bg-[#CCFF53]' : 'bg-[#FF5757]'
            }`}
          >
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Закрыть"
              className="shrink-0 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
