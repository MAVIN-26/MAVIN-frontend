import Modal from './Modal'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'neutral'
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  tone = 'danger',
  busy = false,
  onConfirm,
  onClose,
}: Props) {
  const confirmClass =
    tone === 'danger'
      ? 'bg-[#D94B4B] hover:bg-[#C13E3E]'
      : 'bg-[#FF7700] hover:bg-[#E66A00]'

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="sm">
      <p className="text-sm text-[#3C3C3C]">{message}</p>
      <div className="flex items-center justify-end gap-3 pt-5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-full text-sm text-[#3C3C3C] hover:bg-[#F0F0F0]"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`px-5 py-2 rounded-full text-white text-sm font-medium disabled:opacity-60 ${confirmClass}`}
        >
          {busy ? 'Выполняется…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
