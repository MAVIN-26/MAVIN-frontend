import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import type { MenuItemPublic } from '../types/menuItem'

interface Props {
  item: MenuItemPublic | null
  onClose: () => void
}

export default function DishModal({ item, onClose }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const add = useCartStore((s) => s.add)

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!item) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prev
    }
  }, [item, onClose])

  if (!item) return null

  const {
    name,
    description,
    photo_url,
    price,
    weight_grams,
    calories,
    proteins,
    fats,
    carbs,
    allergens,
  } = item

  const priceLabel = `${Math.round(price)} ₽`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[720px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 text-[#0C0310] flex items-center justify-center shadow-sm hover:bg-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="md:w-1/2 aspect-square bg-[#D9D9D9] shrink-0">
          {photo_url && (
            <img
              src={photo_url}
              alt={name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex-1 p-5 flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#0C0310]">{name}</h2>
            {weight_grams != null && (
              <div className="text-xs text-[#8C8C8C] mt-0.5">
                Вес: {weight_grams} г
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-semibold text-[#0C0310]">
              {priceLabel}
            </div>
            <button
              type="button"
              disabled={!isAuthenticated}
              onClick={() => {
                add(item.id, 1)
                onClose()
              }}
              title={
                !isAuthenticated ? 'Войдите, чтобы добавить' : undefined
              }
              className="px-5 py-2 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E66A00] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Добавить
            </button>
          </div>

          {description && (
            <div>
              <div className="text-xs text-[#8C8C8C]">Описание</div>
              <p className="text-sm text-[#0C0310] mt-1 whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#F0F0F0]">
            <Macro label="Белки" value={proteins} unit="г" />
            <Macro label="Жиры" value={fats} unit="г" />
            <Macro label="Углеводы" value={carbs} unit="г" />
            <Macro label="Калории" value={calories} unit="ккал" />
          </div>

          {allergens.length > 0 && (
            <div className="text-xs text-[#3C3C3C]">
              <span className="text-[#8C8C8C]">Аллергены: </span>
              {allergens.map((a) => a.name).join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Macro({
  label,
  value,
  unit,
}: {
  label: string
  value: number | null
  unit: string
}) {
  return (
    <div className="text-center">
      <div className="text-xs text-[#8C8C8C]">{label}</div>
      <div className="text-sm text-[#0C0310]">
        {value != null ? `${value} ${unit}` : '—'}
      </div>
    </div>
  )
}
