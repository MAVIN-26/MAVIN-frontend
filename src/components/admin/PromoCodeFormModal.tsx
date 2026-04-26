import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import Modal from '../Modal'
import type { PromoCode } from '../../types/promo'

interface Props {
  open: boolean
  mode: 'create' | 'edit'
  initial: PromoCode | null
  onClose: () => void
  onSubmit: (body: SubmitBody) => Promise<void>
}

// SubmitBody — нормализованные значения формы. Пустая дата = null (бессрочный).
export interface SubmitBody {
  code: string
  discount_percent: number
  expires_at: string | null
  is_active: boolean
}

// "2025-12-31T23:59:59Z" -> "2025-12-31T23:59" (для <input type="datetime-local">)
function isoToInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

// "2025-12-31T23:59" -> ISO в UTC
function inputValueToIso(v: string): string | null {
  if (!v) return null
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export default function PromoCodeFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [code, setCode] = useState('')
  const [percent, setPercent] = useState('')
  const [expires, setExpires] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (mode === 'edit' && initial) {
      setCode(initial.code)
      setPercent(String(initial.discount_percent))
      setExpires(isoToInputValue(initial.expires_at))
      setIsActive(initial.is_active)
    } else {
      setCode('')
      setPercent('')
      setExpires('')
      setIsActive(true)
    }
  }, [open, mode, initial])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    const c = code.trim().toUpperCase()
    const p = Number(percent)

    if (mode === 'create' && !c) {
      setError('Введите код')
      return
    }
    if (!Number.isFinite(p) || p <= 0 || p > 100) {
      setError('Скидка должна быть от 1 до 100')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        code: c,
        discount_percent: p,
        expires_at: inputValueToIso(expires),
        is_active: isActive,
      })
    } catch (err: unknown) {
      let msg = 'Не удалось сохранить промокод'
      if (axios.isAxiosError(err)) {
        const detail = (err.response?.data as { detail?: string } | undefined)
          ?.detail
        if (detail) msg = detail
      } else if (err instanceof Error) {
        msg = err.message
      }
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={submitting ? () => undefined : onClose}
      title={mode === 'create' ? 'Создать промокод' : 'Редактировать промокод'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#3C3C3C]">Код</span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={mode === 'edit'}
            className="px-3 py-2 rounded-lg border border-[#E5E5E5] text-sm uppercase disabled:bg-[#FAFAFA] disabled:text-[#8C8C8C]"
            placeholder="SUMMER25"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#3C3C3C]">Скидка, %</span>
          <input
            type="number"
            min={1}
            max={100}
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E5E5E5] text-sm"
            placeholder="15"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-[#3C3C3C]">Действует до</span>
          <input
            type="datetime-local"
            value={expires}
            onChange={(e) => setExpires(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E5E5E5] text-sm"
          />
          <span className="text-[11px] text-[#8C8C8C]">
            Оставьте пустым — бессрочный
          </span>
        </label>

        {mode === 'edit' && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="text-sm text-[#0C0310]">Активен</span>
          </label>
        )}

        {error && (
          <div className="text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-full border border-[#E5E5E5] text-sm disabled:opacity-60"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E66A00] disabled:opacity-60"
          >
            {submitting ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
