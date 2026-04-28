import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import Modal from './Modal'
import { changePassword } from '../api/profile'
import { toast } from '../store/toastStore'

interface Props {
  open: boolean
  onClose: () => void
}

const MIN_LENGTH = 6

export default function PasswordChangeModal({ open, onClose }: Props) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Reset on open so stale values/errors don't linger across openings.
  useEffect(() => {
    if (!open) return
    setOldPassword('')
    setNewPassword('')
    setConfirm('')
    setError(null)
  }, [open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (!oldPassword || !newPassword || !confirm) {
      setError('Заполните все поля')
      return
    }
    if (newPassword.length < MIN_LENGTH) {
      setError(`Новый пароль должен быть не короче ${MIN_LENGTH} символов`)
      return
    }
    if (newPassword !== confirm) {
      setError('Пароли не совпадают')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      })
      toast.success('Пароль изменён')
      onClose()
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Неверный текущий пароль')
      } else {
        const message =
          err instanceof Error ? err.message : 'Не удалось сменить пароль'
        toast.error(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Смена пароля" maxWidth="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Текущий пароль"
          value={oldPassword}
          onChange={setOldPassword}
          autoComplete="current-password"
        />
        <Field
          label="Новый пароль"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
        />
        <Field
          label="Подтверждение нового пароля"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        {error && (
          <div className="text-sm text-red-600" role="alert">
            {error}
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
            className="px-5 py-2 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56A00] disabled:opacity-60"
          >
            {submitting ? 'Сохраняем…' : 'Сохранить'}
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
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="block text-xs text-[#8C8C8C] mb-1">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] bg-white text-sm text-[#0C0310] focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
      />
    </label>
  )
}
