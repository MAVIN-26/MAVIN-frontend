import { useEffect } from 'react'
import { useUserChoice } from '../hooks/useMenu'
import MenuItemCard from './MenuItemCard'
import type { MenuItemPublic, MenuQuery } from '../types/menuItem'

interface Props {
  restaurantId: number
  id?: string
  filters?: MenuQuery
  onItemClick?: (item: MenuItemPublic) => void
  onItemAdd?: (item: MenuItemPublic) => void
  onEmptyChange?: (isEmpty: boolean) => void
}

export default function UserChoiceSection({
  restaurantId,
  id,
  filters,
  onItemClick,
  onItemAdd,
  onEmptyChange,
}: Props) {
  const { items, loading, error } = useUserChoice(restaurantId, filters)

  // Expose emptiness so parent can hide the nav chip for this section.
  useEffect(() => {
    if (loading || error) return
    onEmptyChange?.(items.length === 0)
  }, [loading, error, items.length, onEmptyChange])

  return (
    <section id={id} className="flex flex-col gap-3 scroll-mt-24">
      <h2 className="text-lg font-semibold text-[#0C0310]">
        Выбор пользователей
      </h2>

      {loading && <MenuGridSkeleton />}

      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-sm text-[#8C8C8C]">Пока нет данных</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onClick={onItemClick}
              onAdd={onItemAdd}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function MenuGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col animate-pulse">
          <div className="aspect-square w-full rounded-xl bg-[#E5E5E5]" />
          <div className="mt-2 h-4 w-1/2 rounded bg-[#E5E5E5]" />
          <div className="mt-1 h-3 w-3/4 rounded bg-[#E5E5E5]" />
        </div>
      ))}
    </div>
  )
}
