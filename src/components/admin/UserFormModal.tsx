import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import Modal from '../Modal'
import { createAdminUser } from '../../api/adminUsers'
import type { AdminCreatableRole } from '../../types/adminUser'
import { toast } from '../../store/toastStore'
import { handlePhoneChange, normalizePhone } from '../../utils/phone'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 6

export default function UserFormModal({ open, onClose, onCreated }: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<AdminCreatableRole>('customer')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setRole('customer')
    setError(null)
  }, [open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    const fn = firstName.trim()
    const ln = lastName.trim()
    const em = email.trim()
    const ph = normalizePhone(phone)

    if (!fn || !ln || !em || !ph || !password) {
      setError('Заполните все поля')
      return
    }
    if (!EMAIL_RE.test(em)) {
      setError('Некорректный email')
      return
    }
    if (!/^\+7\d{10}$/.test(ph)) {
      setError('Некорректный формат телефона')
      return
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Пароль должен быть не короче ${MIN_PASSWORD} символов`)
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await createAdminUser({
        first_name: fn,
        last_name: ln,
        email: em,
        phone: ph,
        password,
        role,
      })
      toast.success('Пользователь создан')
      onCreated()
      onClose()
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const detail = (e.response?.data as { detail?: string } | undefined)
          ?.detail
        if (e.response?.status === 409) {
          setError(detail ?? 'Email или телефон уже заняты')
        } else {
          setError(detail ?? 'Не удалось создать пользователя')
        }
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Не удалось создать пользователя')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Создать пользователя" maxWidth="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Имя">
            <TextInput value={firstName} onChange={setFirstName} autoComplete="given-name" />
          </Field>
          <Field label="Фамилия">
            <TextInput value={lastName} onChange={setLastName} autoComplete="family-name" />
          </Field>
        </div>
        <Field label="Эл. почта">
          <TextInput value={email} onChange={setEmail} type="email" autoComplete="email" />
        </Field>
        <Field label="Телефон">
          <input
            type="tel"
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onChange={(e) => setPhone(handlePhoneChange(e.target.value, phone))}
            autoComplete="tel"
            className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
          />
        </Field>
        <Field label="Пароль">
          <TextInput value={password} onChange={setPassword} type="password" autoComplete="new-password" />
        </Field>
        <Field label="Роль">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminCreatableRole)}
            className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
          >
            <option value="customer">Покупатель</option>
            <option value="restaurant_admin">Администратор ресторана</option>
          </select>
        </Field>

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
            className="px-5 py-2 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E66A00] disabled:opacity-60"
          >
            {submitting ? 'Создаём…' : 'Создать'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-[#8C8C8C] mb-1">{label}</span>
      {children}
    </label>
  )
}

function TextInput({
  value,
  onChange,
  type = 'text',
  autoComplete,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  autoComplete?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
    />
  )
}
