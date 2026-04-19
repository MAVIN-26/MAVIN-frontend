import { useEffect, useState, type FormEvent } from 'react'
import Modal from './Modal'
import { useAuthStore } from '../store/authStore'
import { updateProfile } from '../api/profile'
import { toast } from '../store/toastStore'

interface Props {
  open: boolean
  onClose: () => void
}

// Simple email shape check. Server remains source of truth; we just catch
// obvious typos before a round-trip.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function MyDataModal({ open, onClose }: Props) {
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  // Seed form from store whenever the modal opens / user changes.
  useEffect(() => {
    if (!open || !user) return
    setFirstName(user.first_name)
    setLastName(user.last_name)
    setEmail(user.email)
    setFieldError(null)
  }, [open, user])

  if (!user) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    const fn = firstName.trim()
    const ln = lastName.trim()
    const em = email.trim()

    if (!fn || !ln || !em) {
      setFieldError('Заполните все поля')
      return
    }
    if (!EMAIL_RE.test(em)) {
      setFieldError('Некорректный email')
      return
    }

    setFieldError(null)
    setSubmitting(true)
    try {
      await updateProfile({
        first_name: fn,
        last_name: ln,
        email: em,
        // Keep current allergens — this modal doesn't edit them.
        allergen_ids: user.allergens.map((a) => a.id),
      })
      await fetchMe()
      toast.success('Изменения сохранены')
      onClose()
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Не удалось сохранить изменения'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Мои данные">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Имя"
          value={firstName}
          onChange={setFirstName}
          autoComplete="given-name"
        />
        <Field
          label="Фамилия"
          value={lastName}
          onChange={setLastName}
          autoComplete="family-name"
        />
        <Field
          label="Телефон"
          value={user.phone}
          onChange={() => {}}
          disabled
        />
        <Field
          label="Эл. почта"
          value={email}
          onChange={setEmail}
          type="email"
          autoComplete="email"
        />

        {fieldError && (
          <div className="text-sm text-red-600" role="alert">
            {fieldError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-sm text-[#3C3C3C] hover:bg-[#F0F0F0]"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E66A00] disabled:opacity-60"
          >
            {submitting ? 'Сохраняем…' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  disabled?: boolean
  autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="block text-xs text-[#8C8C8C] mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`w-full h-11 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40 ${
          disabled
            ? 'bg-[#F0F0F0] text-[#8C8C8C] border-[#E5E5E5] cursor-not-allowed'
            : 'bg-white text-[#0C0310] border-[#E5E5E5]'
        }`}
      />
    </label>
  )
}
