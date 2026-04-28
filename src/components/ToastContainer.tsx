import { useToastStore } from '../store/toastStore'

export default function ToastContainer() {
  const { toasts } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.kind === 'success'
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto min-w-[260px] max-w-[360px] px-5 py-3 rounded-2xl shadow-lg text-sm text-black ${
              isSuccess ? 'bg-[#EFFFD4]' : 'bg-[#FFD4D4]'
            }`}
          >
            <span className="leading-snug">{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
