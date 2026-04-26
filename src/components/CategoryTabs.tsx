import { useSearchParams } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'

export default function CategoryTabs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, loading, error } = useCategories()

  const currentRaw = searchParams.get('category_id')
  const current = currentRaw ? Number(currentRaw) : null

  const setCategory = (id: number | null) => {
    const next = new URLSearchParams(searchParams)
    if (id === null) next.delete('category_id')
    else next.set('category_id', String(id))
    setSearchParams(next, { replace: false })
  }

  const chipBase =
    'shrink-0 h-[43px] px-4 rounded-[10px] text-sm text-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7700]/60'
  const chipActive = 'bg-[#FF7700]'
  const chipIdle = 'bg-[#EBEBEB] hover:bg-[#E0E0E0]'

  if (error) {
    return (
      <div className="mb-6 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
        {error}
      </div>
    )
  }

  return (
    <div className="mb-6 bg-[#FAFAFA] rounded-full p-2 flex items-center gap-2 overflow-x-auto">
      <button
        type="button"
        onClick={() => setCategory(null)}
        className={`${chipBase} ${current === null ? chipActive : chipIdle}`}
      >
        Все
      </button>

      {loading && items.length === 0
        ? Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 h-[43px] w-20 rounded-[10px] bg-[#EBEBEB] animate-pulse"
            />
          ))
        : items.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`${chipBase} ${current === c.id ? chipActive : chipIdle}`}
            >
              {c.name}
            </button>
          ))}
    </div>
  )
}
