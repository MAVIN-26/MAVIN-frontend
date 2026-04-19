import { useEffect, useState, type FormEvent } from 'react'
import axios from 'axios'
import Modal from '../Modal'
import { useCategories } from '../../hooks/useCategories'
import { listRestaurantAdminUsers } from '../../api/adminUsers'
import type { UserProfile } from '../../types/auth'
import type { RestaurantAdmin } from '../../types/restaurantAdmin'
import { toast } from '../../store/toastStore'

interface Props {
  open: boolean
  mode: 'create' | 'edit'
  initial: RestaurantAdmin | null // required for edit, ignored for create
  onClose: () => void
  onSubmit: (body: SubmitBody) => Promise<void>
}

// Union body — the submit callback decides which API call to use based on mode.
export interface SubmitBody {
  name: string
  pickup_address: string
  restaurant_admin_id: number
  category_ids: number[]
  preparation_time_min: number | null
  preparation_time_max: number | null
  description?: string
  photo_url?: string
}

export default function RestaurantFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const { items: categories, loading: catsLoading } = useCategories()
  const [admins, setAdmins] = useState<UserProfile[]>([])
  const [adminsLoading, setAdminsLoading] = useState(false)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [adminId, setAdminId] = useState<number | ''>('')
  const [catIds, setCatIds] = useState<Set<number>>(new Set())
  const [prepMin, setPrepMin] = useState('')
  const [prepMax, setPrepMax] = useState('')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Seed form from `initial` each time the modal opens.
  useEffect(() => {
    if (!open) return
    setError(null)
    if (mode === 'edit' && initial) {
      setName(initial.name)
      setAddress(initial.pickup_address)
      setAdminId(initial.restaurant_admin_id ?? '')
      setCatIds(new Set(initial.categories.map((c) => c.id)))
      setPrepMin(
        initial.preparation_time_min != null
          ? String(initial.preparation_time_min)
          : '',
      )
      setPrepMax(
        initial.preparation_time_max != null
          ? String(initial.preparation_time_max)
          : '',
      )
      setDescription(initial.description ?? '')
      setPhotoUrl(initial.photo_url ?? '')
    } else {
      setName('')
      setAddress('')
      setAdminId('')
      setCatIds(new Set())
      setPrepMin('')
      setPrepMax('')
      setDescription('')
      setPhotoUrl('')
    }
  }, [open, mode, initial])

  // Load admin dropdown once per open.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setAdminsLoading(true)
    listRestaurantAdminUsers()
      .then((items) => {
        if (cancelled) return
        setAdmins(items)
      })
      .catch(() => {
        if (cancelled) return
        toast.error('Не удалось загрузить список администраторов')
      })
      .finally(() => {
        if (!cancelled) setAdminsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  const toggleCat = (id: number) => {
    setCatIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    const n = name.trim()
    const a = address.trim()
    if (!n || !a) {
      setError('Заполните название и адрес')
      return
    }
    if (adminId === '') {
      setError('Выберите администратора')
      return
    }
    if (catIds.size === 0) {
      setError('Выберите хотя бы одну категорию')
      return
    }

    const pMin = prepMin.trim() === '' ? null : Number(prepMin)
    const pMax = prepMax.trim() === '' ? null : Number(prepMax)
    if (
      (pMin != null && (Number.isNaN(pMin) || pMin < 0)) ||
      (pMax != null && (Number.isNaN(pMax) || pMax < 0))
    ) {
      setError('Время приготовления должно быть положительным числом')
      return
    }

    const body: SubmitBody = {
      name: n,
      pickup_address: a,
      restaurant_admin_id: adminId,
      category_ids: Array.from(catIds),
      preparation_time_min: pMin,
      preparation_time_max: pMax,
    }
    if (mode === 'edit') {
      body.description = description
      body.photo_url = photoUrl
    }

    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(body)
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const detail = (e.response?.data as { detail?: string } | undefined)
          ?.detail
        setError(detail ?? 'Не удалось сохранить')
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Не удалось сохранить')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Создать ресторан' : 'Редактировать ресторан'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Название">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
          />
        </Field>

        <Field label="Адрес самовывоза">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
          />
        </Field>

        <Field label="Администратор">
          <select
            value={adminId === '' ? '' : String(adminId)}
            onChange={(e) => {
              const v = e.target.value
              setAdminId(v === '' ? '' : Number(v))
            }}
            disabled={adminsLoading}
            className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
          >
            <option value="">— не выбран —</option>
            {admins.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name} ({u.phone})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Категории">
          {catsLoading ? (
            <div className="text-sm text-[#8C8C8C]">Загрузка…</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const on = catIds.has(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCat(c.id)}
                    className={`px-3 py-1.5 rounded-full text-xs border ${
                      on
                        ? 'bg-[#FF7700] border-[#FF7700] text-white'
                        : 'bg-white border-[#E5E5E5] text-[#0C0310] hover:bg-[#F0F0F0]'
                    }`}
                  >
                    {c.name}
                  </button>
                )
              })}
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Время приготовления, мин (от)">
            <input
              type="number"
              min={0}
              value={prepMin}
              onChange={(e) => setPrepMin(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
            />
          </Field>
          <Field label="Время приготовления, мин (до)">
            <input
              type="number"
              min={0}
              value={prepMax}
              onChange={(e) => setPrepMax(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
            />
          </Field>
        </div>

        {mode === 'edit' && (
          <>
            <Field label="Описание">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
              />
            </Field>
            <Field label="URL фото">
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
              />
            </Field>
          </>
        )}

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
            {submitting
              ? 'Сохраняем…'
              : mode === 'create'
                ? 'Создать'
                : 'Сохранить'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-xs text-[#8C8C8C] mb-1">{label}</span>
      {children}
    </label>
  )
}

