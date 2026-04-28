import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  getOwnerRestaurant,
  updateOwnerRestaurant,
} from '../../api/ownerRestaurant'
import { uploadImage } from '../../api/upload'
import type {
  RestaurantOwner,
  RestaurantOwnerUpdateBody,
} from '../../types/restaurantOwner'
import { toast } from '../../store/toastStore'
import Spinner from '../../components/Spinner'

interface FormState {
  name: string
  description: string
  pickup_address: string
  photo_url: string
  preparation_time_min: string
  preparation_time_max: string
}

const EMPTY: FormState = {
  name: '',
  description: '',
  pickup_address: '',
  photo_url: '',
  preparation_time_min: '',
  preparation_time_max: '',
}

export default function OwnerRestaurantProfilePage() {
  const [data, setData] = useState<RestaurantOwner | null>(null)
  const [state, setState] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getOwnerRestaurant()
      .then((r) => {
        if (cancelled) return
        setData(r)
        setState({
          name: r.name,
          description: r.description ?? '',
          pickup_address: r.pickup_address,
          photo_url: r.photo_url ?? '',
          preparation_time_min:
            r.preparation_time_min != null ? String(r.preparation_time_min) : '',
          preparation_time_max:
            r.preparation_time_max != null ? String(r.preparation_time_max) : '',
        })
        setError(null)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setError(apiMessage(e, 'Не удалось загрузить профиль ресторана'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handlePhotoPick = async (file: File | null) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл больше 5 МБ')
      return
    }
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setState((s) => ({ ...s, photo_url: url }))
    } catch (e: unknown) {
      toast.error(apiMessage(e, 'Не удалось загрузить фото'))
    } finally {
      setUploading(false)
    }
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!state.name.trim()) next.name = 'Укажите название'
    if (!state.pickup_address.trim()) next.pickup_address = 'Укажите адрес'
    const min = state.preparation_time_min
    const max = state.preparation_time_max
    if (min !== '' && (Number.isNaN(Number(min)) || Number(min) < 0))
      next.preparation_time_min = 'Минуты должны быть числом'
    if (max !== '' && (Number.isNaN(Number(max)) || Number(max) < 0))
      next.preparation_time_max = 'Минуты должны быть числом'
    if (
      min !== '' &&
      max !== '' &&
      Number(min) > Number(max) &&
      !next.preparation_time_min &&
      !next.preparation_time_max
    ) {
      next.preparation_time_max = 'Максимум не меньше минимума'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const body: RestaurantOwnerUpdateBody = {
        name: state.name.trim(),
        description: state.description.trim(),
        pickup_address: state.pickup_address.trim(),
        photo_url: state.photo_url || undefined,
        preparation_time_min:
          state.preparation_time_min === ''
            ? null
            : Number(state.preparation_time_min),
        preparation_time_max:
          state.preparation_time_max === ''
            ? null
            : Number(state.preparation_time_max),
      }
      const updated = await updateOwnerRestaurant(body)
      setData(updated)
      toast.success('Изменения сохранены')
    } catch (e: unknown) {
      toast.error(apiMessage(e, 'Не удалось сохранить изменения'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Spinner />
  }

  if (error || !data) {
    return (
      <div className="text-sm text-red-600" role="alert">
        {error ?? 'Профиль не найден'}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 max-w-[720px]">
      <h1 className="text-2xl font-semibold text-[#0C0310]">Профиль ресторана</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E5E5E5] rounded-2xl p-6 flex flex-col gap-4"
      >
        <Field label="Название ресторана" error={errors.name}>
          <input
            type="text"
            value={state.name}
            onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
            className={inputCls}
          />
        </Field>

        <Field label="Описание">
          <textarea
            rows={3}
            value={state.description}
            onChange={(e) =>
              setState((s) => ({ ...s, description: e.target.value }))
            }
            className={`${inputCls} resize-none`}
          />
        </Field>

        <Field label="Адрес самовывоза" error={errors.pickup_address}>
          <input
            type="text"
            value={state.pickup_address}
            onChange={(e) =>
              setState((s) => ({ ...s, pickup_address: e.target.value }))
            }
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Время приготовления от, мин"
            error={errors.preparation_time_min}
          >
            <input
              type="number"
              min="0"
              value={state.preparation_time_min}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  preparation_time_min: e.target.value,
                }))
              }
              className={inputCls}
            />
          </Field>
          <Field
            label="Время приготовления до, мин"
            error={errors.preparation_time_max}
          >
            <input
              type="number"
              min="0"
              value={state.preparation_time_max}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  preparation_time_max: e.target.value,
                }))
              }
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F0F0F0]">
          <div>
            <div className="text-sm text-[#3C3C3C] mb-1">Средний рейтинг</div>
            <div className="text-[#0C0310] text-sm">
              {data.average_rating.toFixed(1).replace('.', ',')}{' '}
              <span className="text-[#8C8C8C]">
                · {data.review_count} отзывов
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-[#3C3C3C] mb-1">Категории кухни</div>
            {data.categories.length === 0 ? (
              <span className="text-[#8C8C8C] text-sm">—</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {data.categories.map((c) => (
                  <span
                    key={c.id}
                    className="px-2 py-0.5 rounded-full bg-[#F0F0F0] text-xs text-[#0C0310]"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="text-sm text-[#3C3C3C] mb-2">Фото ресторана</div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-lg bg-[#F0F0F0] overflow-hidden border border-[#E5E5E5] shrink-0">
              {state.photo_url && (
                <img
                  src={state.photo_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <label className="px-4 py-2 rounded-full bg-[#FF7700] text-white text-sm font-medium cursor-pointer hover:bg-[#E56A00]">
              {uploading ? 'Загрузка…' : 'Загрузить'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => handlePhotoPick(e.target.files?.[0] ?? null)}
              />
            </label>
            <span className="text-xs text-[#8C8C8C]">
              макс. 5 МБ · JPEG/PNG/WebP
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-5 py-2.5 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56A00] disabled:opacity-60"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls =
  'w-full h-10 px-3 rounded-lg border border-[#E5E5E5] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="text-sm text-[#3C3C3C] mb-1">{label}</div>
      {children}
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </label>
  )
}

function apiMessage(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const detail = (e.response?.data as { detail?: string } | undefined)?.detail
    if (detail) return detail
  }
  return e instanceof Error ? e.message : fallback
}
