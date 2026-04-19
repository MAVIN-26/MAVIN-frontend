import { useEffect, useState } from 'react'
import FilterPopover from './FilterPopover'
import type { KbjuValues } from '../hooks/useMenuFilters'

interface Props {
  open: boolean
  initial: KbjuValues
  onClose: () => void
  onApply: (values: KbjuValues) => void
}

type FormState = Record<keyof KbjuValues, string>

const EMPTY: FormState = {
  max_calories: '',
  max_price: '',
  max_proteins: '',
  max_fats: '',
  max_carbs: '',
}

function toForm(v: KbjuValues): FormState {
  return {
    max_calories: v.max_calories?.toString() ?? '',
    max_price: v.max_price?.toString() ?? '',
    max_proteins: v.max_proteins?.toString() ?? '',
    max_fats: v.max_fats?.toString() ?? '',
    max_carbs: v.max_carbs?.toString() ?? '',
  }
}

function toValues(form: FormState): KbjuValues {
  const result: KbjuValues = {}
  ;(Object.keys(form) as (keyof FormState)[]).forEach((key) => {
    const raw = form[key].trim()
    if (raw === '') return
    const num = Number(raw)
    if (Number.isFinite(num) && num >= 0) result[key] = num
  })
  return result
}

export default function KbjuFilter({ open, initial, onClose, onApply }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY)

  // Sync form with initial each time popover opens.
  useEffect(() => {
    if (open) setForm(toForm(initial))
  }, [open, initial])

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleApply = () => {
    onApply(toValues(form))
    onClose()
  }

  const handleClear = () => {
    setForm(EMPTY)
    onApply({})
    onClose()
  }

  return (
    <FilterPopover open={open} onClose={onClose} title="КБЖУ / цена">
      <div className="flex flex-col gap-3">
        <Field label="Калории, до" value={form.max_calories} onChange={update('max_calories')} suffix="ккал" />
        <Field label="Цена, до" value={form.max_price} onChange={update('max_price')} suffix="₽" />
        <Field label="Белки, до" value={form.max_proteins} onChange={update('max_proteins')} suffix="г" />
        <Field label="Жиры, до" value={form.max_fats} onChange={update('max_fats')} suffix="г" />
        <Field label="Углеводы, до" value={form.max_carbs} onChange={update('max_carbs')} suffix="г" />

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 py-2 rounded-full bg-[#FAFAFA] text-[#3C3C3C] text-sm hover:bg-[#F0F0F0]"
          >
            Очистить
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2 rounded-full bg-[#FF7700] text-white text-sm hover:bg-[#E66A00]"
          >
            Применить
          </button>
        </div>
      </div>
    </FilterPopover>
  )
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  suffix: string
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm text-[#3C3C3C]">{label}</span>
      <span className="relative">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onChange={onChange}
          className="w-28 pl-2 pr-10 py-1.5 rounded-lg bg-[#FAFAFA] border border-[#F0F0F0] text-sm text-[#0C0310] focus:outline-none focus:border-[#FF7700]"
        />
        <span className="absolute inset-y-0 right-2 flex items-center text-xs text-[#8C8C8C] pointer-events-none">
          {suffix}
        </span>
      </span>
    </label>
  )
}
