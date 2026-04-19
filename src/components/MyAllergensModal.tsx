import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Modal from './Modal'
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

  // Seed selection from current user's allergens each time modal opens.
  useEffect(() => {
    if (!open || !user) return
    setSelected(new Set(user.allergens.map((a) => a.id)))
  }, [open, user])

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [items],
  )

  if (!user) return null

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
    <Modal open={open} onClose={onClose} title="Мои аллергены" maxWidth="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {loading && (
          <div className="text-sm text-[#8C8C8C]">Загрузка…</div>
        )}
        {error && (
          <div className="text-sm text-red-600" role="alert">
            {error}
          </div>
        )}
        {!loading && !error && sorted.length === 0 && (
          <div className="text-sm text-[#8C8C8C]">Список пуст</div>
        )}
        {!loading && !error && sorted.length > 0 && (
          <ul className="max-h-[320px] overflow-y-auto flex flex-col gap-1 pr-1">
            {sorted.map((a) => {
              const checked = selected.has(a.id)
              return (
                <li key={a.id}>
                  <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#FAFAFA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(a.id)}
                      className="w-4 h-4 accent-[#FF7700]"
                    />
                    <span className="text-sm text-[#0C0310]">{a.name}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#F0F0F0]">
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-[#3C3C3C] hover:text-[#0C0310]"
          >
            Очистить
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-sm text-[#3C3C3C] hover:bg-[#F0F0F0]"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="px-5 py-2 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E66A00] disabled:opacity-60"
            >
              {submitting ? 'Сохраняем…' : 'Сохранить изменения'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
