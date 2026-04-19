import MenuItemCard from './MenuItemCard'
import type { MenuItemPublic } from '../types/menuItem'

interface Props {
  id: string
  title: string
  items: MenuItemPublic[]
  onItemClick?: (item: MenuItemPublic) => void
  onItemAdd?: (item: MenuItemPublic) => void
}

export default function MenuCategorySection({
  id,
  title,
  items,
  onItemClick,
  onItemAdd,
}: Props) {
  if (items.length === 0) return null
  return (
    <section id={id} className="flex flex-col gap-3 scroll-mt-24">
      <h2 className="text-lg font-semibold text-[#0C0310]">{title}</h2>
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
    </section>
  )
}
