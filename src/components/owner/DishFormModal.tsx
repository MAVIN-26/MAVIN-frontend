import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Modal from '../Modal'
import type { MenuCategory } from '../../types/menuCategory'
import type { MenuItemOwner, MenuItemCreateBody } from '../../types/menuItemOwner'
import { useAllergens } from '../../hooks/useAllergens'
import { uploadImage } from '../../api/upload'
import { toast } from '../../store/toastStore'

type Mode = 'create' | 'edit'

interface Props {
  open: boolean
  mode: Mode
  initial: MenuItemOwner | null
  categories: MenuCategory[]
  onClose: () => void
  onSubmit: (body: MenuItemCreateBody) => Promise<void>
}

interface FormState {
  name: string
  price: string
  menu_category_id: number | null
  description: string
  photo_url: string
  calories: string
  proteins: string
  fats: string
  carbs: string
  weight_grams: string
  allergen_ids: Set<number>
}

const EMPTY: FormState = {
  name: '',
  price: '',
  menu_category_id: null,
  description: '',
  photo_url: '',
  calories: '',
  proteins: '',
  fats: '',
  carbs: '',
  weight_grams: '',
  allergen_ids: new Set(),
}

export default function DishFormModal({
  open,
  mode,
  initial,
  categories,
  onClose,
  onSubmit,
}: Props) {
  const { items: allergens } = useAllergens()
  const [state, setState] = useState<FormState>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initial) {
      setState({
        name: initial.name,
        price: String(initial.price ?? ''),
        menu_category_id: initial.menu_category_id,
        description: initial.description ?? '',
        photo_url: initial.photo_url ?? '',
        calories: initial.calories != null ? String(initial.calories) : '',
        proteins: initial.proteins != null ? String(initial.proteins) : '',
        fats: initial.fats != null ? String(initial.fats) : '',
        carbs: initial.carbs != null ? String(initial.carbs) : '',
        weight_grams:
          initial.weight_grams != null ? String(initial.weight_grams) : '',
        allergen_ids: new Set(initial.allergens.map((a) => a.id)),
      })
    } else {
      setState(EMPTY)
    }
    setErrors({})
    setFormError(null)
  }, [open, mode, initial])

  const sortedAllergens = useMemo(
    () =>
      [...allergens].sort((a, b) =>
        a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }),
      ),
    [allergens],
  )

  const toggleAllergen = (id: number) => {
    setState((s) => {
      const next = new Set(s.allergen_ids)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...s, allergen_ids: next }
    })
  }

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
    const priceNum = Number(state.price)
    if (!state.price || Number.isNaN(priceNum) || priceNum <= 0) {
      next.price = 'Введите цену'
    }
    if (state.menu_category_id == null) next.menu_category_id = 'Выберите категорию'
    for (const [key, label] of [
      ['calories', 'Калории'],
      ['proteins', 'Белки'],
      ['fats', 'Жиры'],
      ['carbs', 'Углеводы'],
      ['weight_grams', 'Вес'],
    ] as const) {
      const v = state[key]
      if (v !== '' && Number.isNaN(Number(v))) next[key] = `${label}: число`
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return
    if (state.menu_category_id == null) return
    setSubmitting(true)
    try {
      const body: MenuItemCreateBody = {
        name: state.name.trim(),
        price: Number(state.price),
        menu_category_id: state.menu_category_id,
        description: state.description.trim() || undefined,
        photo_url: state.photo_url || undefined,
        calories: state.calories ? Number(state.calories) : undefined,
        proteins: state.proteins ? Number(state.proteins) : undefined,
        fats: state.fats ? Number(state.fats) : undefined,
        carbs: state.carbs ? Number(state.carbs) : undefined,
        weight_grams: state.weight_grams ? Number(state.weight_grams) : undefined,
        allergen_ids: Array.from(state.allergen_ids),
      }
      await onSubmit(body)
    } catch (e: unknown) {
      setFormError(apiMessage(e, 'Не удалось сохранить'))
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'create' ? 'Новое блюдо' : 'Редактировать блюдо'

  return (
    <Modal open={open} title={title} onClose={onClose} maxWidth="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Название" error={errors.name}>
          <input
            type="text"
            value={state.name}
            onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Цена, ₽" error={errors.price}>
            <input
              type="number"
              min="0"
              step="1"
              value={state.price}
              onChange={(e) => setState((s) => ({ ...s, price: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Категория меню" error={errors.menu_category_id}>
            <select
              value={state.menu_category_id ?? ''}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  menu_category_id: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className={inputCls}
            >
              <option value="">— выберите —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <Field label="Калории" error={errors.calories}>
            <input
              type="number"
              min="0"
              value={state.calories}
              onChange={(e) => setState((s) => ({ ...s, calories: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Белки, г" error={errors.proteins}>
            <input
              type="number"
              min="0"
              step="0.1"
              value={state.proteins}
              onChange={(e) => setState((s) => ({ ...s, proteins: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Жиры, г" error={errors.fats}>
            <input
              type="number"
              min="0"
              step="0.1"
              value={state.fats}
              onChange={(e) => setState((s) => ({ ...s, fats: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Углеводы, г" error={errors.carbs}>
            <input
              type="number"
              min="0"
              step="0.1"
              value={state.carbs}
              onChange={(e) => setState((s) => ({ ...s, carbs: e.target.value }))}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Вес, г" error={errors.weight_grams}>
          <input
            type="number"
            min="0"
            value={state.weight_grams}
            onChange={(e) =>
              setState((s) => ({ ...s, weight_grams: e.target.value }))
            }
            className={inputCls}
          />
        </Field>

        <Field label="Описание">
          <textarea
            rows={2}
            value={state.description}
            onChange={(e) =>
              setState((s) => ({ ...s, description: e.target.value }))
            }
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div>
          <div className="text-sm text-[#3C3C3C] mb-2">Аллергены</div>
          <div className="flex flex-col gap-1 max-h-40 overflow-auto pr-1">
            {sortedAllergens.map((a) => {
              const checked = state.allergen_ids.has(a.id)
              return (
                <label
                  key={a.id}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAllergen(a.id)}
                  />
                  {a.name}
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <div className="text-sm text-[#3C3C3C] mb-2">Фото</div>
          <div className="flex items-center gap-3">
            <label className="px-4 py-2 rounded-full bg-[#FF7700] text-white text-sm font-medium cursor-pointer hover:bg-[#E56A00]">
              {uploading ? 'Загрузка…' : 'Выбрать файл'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => handlePhotoPick(e.target.files?.[0] ?? null)}
              />
            </label>
            {state.photo_url && (
              <img
                src={state.photo_url}
                alt=""
                className="w-12 h-12 rounded-lg object-cover border border-[#E5E5E5]"
              />
            )}
            <span className="text-xs text-[#8C8C8C]">макс. 5 МБ · JPEG/PNG/WebP</span>
          </div>
        </div>

        {formError && (
          <div className="text-sm text-red-600" role="alert">
            {formError}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#E5E5E5] text-[#0C0310] text-sm hover:bg-[#D9D9D9]"
          >
            Отменить
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-5 py-2 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56A00] disabled:opacity-60"
          >
            {submitting ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </Modal>
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
