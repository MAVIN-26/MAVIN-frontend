import { useEffect, useState } from 'react'
import FilterPopover from './FilterPopover'
import { useAllergens } from '../hooks/useAllergens'

interface Props {
  open: boolean
  initialIds: number[]
  onClose: () => void
  onApply: (ids: number[]) => void
}

export default function AllergensFilter({
  open,
  initialIds,
  onClose,
  onApply,
}: Props) {
  const { items, loading, error } = useAllergens()
  const [selected, setSelected] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (open) setSelected(new Set(initialIds))
  }, [open, initialIds])

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleApply = () => {
    onApply(Array.from(selected))
    onClose()
  }

  const handleClear = () => {
    setSelected(new Set())
    onApply([])
    onClose()
  }

  return (
    <FilterPopover open={open} onClose={onClose} title="Аллергены">
      {loading && <div className="text-sm text-[#8C8C8C]">Загрузка…</div>}
      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && (
        <>
          <div className="max-h-[260px] overflow-y-auto flex flex-col gap-1 -mx-1 px-1">
            {items.map((a) => {
              const checked = selected.has(a.id)
              return (
                <label
                  key={a.id}
                  className="flex items-center justify-between py-1.5 text-sm text-[#0C0310] cursor-pointer"
                >
                  <span>{a.name}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(a.id)}
                    className="w-4 h-4 accent-[#FF7700]"
                  />
                </label>
              )
            })}
            {items.length === 0 && (
              <div className="text-sm text-[#8C8C8C]">Список пуст</div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
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
              className="flex-1 py-2 rounded-full bg-[#FF7700] text-white text-sm hover:bg-[#E56A00]"
            >
              Сохранить
            </button>
          </div>
        </>
      )}
    </FilterPopover>
  )
}
