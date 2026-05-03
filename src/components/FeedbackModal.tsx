import { useState, type ChangeEvent, type FormEvent } from 'react'
import Modal from './Modal'
import { toast } from '../store/toastStore'

interface Props {
  open: boolean
  onClose: () => void
}

const TOPICS = [
  'Проблема с заказом',
  'Ошибка в приложении',
  'Предложение по меню',
  'Другое',
]

const MAX_PHOTO_MB = 5

export default function FeedbackModal({ open, onClose }: Props) {
  const [topic, setTopic] = useState(TOPICS[0])
  const [message, setMessage] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setTopic(TOPICS[0])
    setMessage('')
    setPhoto(null)
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setPhoto(null)
      return
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      toast.error(`Файл больше ${MAX_PHOTO_MB} МБ`)
      e.target.value = ''
      return
    }
    setPhoto(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error('Введите сообщение')
      return
    }
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 400))
      toast.success('Спасибо! Мы получили ваше обращение')
      reset()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} title="Обратная связь" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-[#0C0310]">Тема обращения</span>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-11 rounded-xl border border-[#E4E4E4] px-3 bg-white text-sm focus:outline-none focus:border-[#FF7700]"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-[#0C0310]">Сообщение</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Опишите подробно, что произошло"
            className="rounded-xl border border-[#E4E4E4] px-3 py-2 bg-white text-sm resize-none focus:outline-none focus:border-[#FF7700]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-[#0C0310]">
            Фото <span className="text-[#8C8C8C]">(необязательно)</span>
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#FAFAFA] file:text-[#0C0310] hover:file:bg-[#F0F0F0]"
          />
          {photo && (
            <span className="text-xs text-[#8C8C8C]">{photo.name}</span>
          )}
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="h-11 px-5 rounded-xl border border-[#E4E4E4] text-sm hover:bg-[#FAFAFA] disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 px-5 rounded-xl bg-[#FF7700] text-white text-sm font-semibold hover:bg-[#E66A00] disabled:opacity-50"
          >
            {submitting ? 'Отправляем…' : 'Отправить'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
