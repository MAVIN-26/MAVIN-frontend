import { useAuthStore } from '../store/authStore'
import type { MenuItemPublic } from '../types/menuItem'

interface Props {
  item: MenuItemPublic
  onClick?: (item: MenuItemPublic) => void
  onAdd?: (item: MenuItemPublic) => void
}

export default function MenuItemCard({ item, onClick, onAdd }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const canAdd = isAuthenticated && !!onAdd
  const { name, photo_url, price, weight_grams, calories } = item
  const priceLabel = formatPrice(price)

  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      className="group flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7700]/60 rounded-xl"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#D9D9D9]">
        {photo_url && (
          <img
            src={photo_url}
            alt={name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (canAdd) onAdd?.(item)
          }}
          disabled={!canAdd}
          aria-label="Добавить в корзину"
          title={!isAuthenticated ? 'Войдите, чтобы добавить' : undefined}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-[#0C0310] shadow-sm flex items-center justify-center hover:bg-[#FF7700] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#0C0310]"
        >
          <PlusIcon />
        </button>
      </div>
      <div className="mt-2 flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-[#FF7700]">{priceLabel}</span>
          {calories > 0 && (
            <span className="text-xs text-[#8C8C8C]">{calories} ккал</span>
          )}
        </div>
        <div className="text-xs font-medium text-[#0C0310] line-clamp-2">{name}</div>
        {weight_grams != null && (
          <div className="text-xs text-[#8C8C8C]">{weight_grams} г</div>
        )}
      </div>
    </button>
  )
}

function formatPrice(price: number): string {
  // Whole rubles; fallback to number if fractional
  const rounded = Math.round(price)
  return `${rounded} ₽`
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
