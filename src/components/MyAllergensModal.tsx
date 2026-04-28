import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useAuthStore } from '../store/authStore'
import { useAllergens } from '../hooks/useAllergens'
import { updateProfile } from '../api/profile'
import { toast } from '../store/toastStore'

interface Props {
  open: boolean
  onClose: () => void
}

export default function MyAllergensModal({ open, onClose }: Props) {
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const { items, loading, error } = useAllergens()

  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !user) return
    setSelected(new Set(user.allergens.map((a) => a.id)))
    setShowPicker(false)
  }, [open, user])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  useEffect(() => {
    if (!showPicker) return
    const onClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [showPicker])

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [items],
  )

  const selectedItems = useMemo(
    () => sorted.filter((a) => selected.has(a.id)),
    [sorted, selected],
  )

  const unselectedItems = useMemo(
    () => sorted.filter((a) => !selected.has(a.id)),
    [sorted, selected],
  )

  if (!open || !user) return null

  const remove = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const add = (id: number) => {
    setSelected((prev) => new Set([...prev, id]))
    if (unselectedItems.length <= 1) setShowPicker(false)
  }

  const clearAll = () => setSelected(new Set())

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await updateProfile({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        allergen_ids: Array.from(selected),
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Аллергены"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="grid grid-cols-[48px_1fr_48px] items-center px-6 pt-6 pb-4">
            <div className="relative" ref={pickerRef}>
              <button
                type="button"
                onClick={() => setShowPicker((v) => !v)}
                aria-label="Добавить аллерген"
                className="w-8 h-8 flex items-center justify-center text-[#0C0310] hover:text-[#FF7700] transition-colors"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>

              {showPicker && (
                <div className="absolute top-10 left-0 z-50 w-56 bg-white rounded-2xl shadow-lg border border-[#F0F0F0] py-2 max-h-52 overflow-y-auto">
                  {loading && (
                    <p className="px-4 py-2 text-sm text-[#8C8C8C]">Загрузка…</p>
                  )}
                  {!loading && unselectedItems.length === 0 && (
                    <p className="px-4 py-2 text-sm text-[#8C8C8C]">Все добавлены</p>
                  )}
                  {!loading && unselectedItems.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => add(a.id)}
                      className="w-full text-left px-4 py-2 text-sm text-[#0C0310] hover:bg-[#F5F5F5]"
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#0C0310] text-center">Аллергены</h2>
            <div />
          </div>

          {/* Allergen rows */}
          <div className="px-6 flex flex-col gap-3 max-h-[320px] overflow-y-auto">
            {error && (
              <p className="text-sm text-red-600" role="alert">{error}</p>
            )}
            {!loading && !error && selectedItems.length === 0 && (
              <p className="text-sm text-[#8C8C8C] py-2">
                Нет выбранных аллергенов. Нажмите «+» чтобы добавить.
              </p>
            )}
            {selectedItems.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between px-5 py-4 bg-[#F5F5F5] rounded-2xl"
              >
                <span className="text-base text-[#8C8C8C]">{a.name}</span>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  aria-label={`Удалить ${a.name}`}
                  className="text-[#3C3C3C] hover:text-red-500 transition-colors"
                >
                  <svg width="22" height="4" viewBox="0 0 22 4" fill="none" aria-hidden>
                    <rect x="0" y="1" width="22" height="2.5" rx="1.25" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Clear button */}
          <div className="px-6 pt-4">
            <button
              type="button"
              onClick={clearAll}
              className="px-5 py-2 rounded-full bg-[#F0F0F0] text-sm text-[#3C3C3C] hover:bg-[#E0E0E0] transition-colors"
            >
              Очистить
            </button>
          </div>

          {/* Save button */}
          <div className="px-6 pt-4 pb-6">
            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full py-4 rounded-2xl bg-[#FF7700] text-white text-base font-bold hover:bg-[#E56A00] transition-colors disabled:opacity-60"
            >
              {submitting ? 'Сохраняем…' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
