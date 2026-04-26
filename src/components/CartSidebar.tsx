import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import Spinner from './Spinner'
import type { CartItem } from '../types/cart'

const PICKUP_OPTIONS = [
  { value: 30, label: 'Через 30 мин' },
  { value: 60, label: 'Через 1 час' },
  { value: 90, label: 'Через 1,5 часа' },
  { value: 120, label: 'Через 2 часа' },
]

const formatPrice = (rub: number) =>
  rub.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽'

/**
 * Right-side cart panel on the restaurant page. Only customers see it.
 * Empty/filled states per design; item controls wired in later steps.
 */
export default function CartSidebar({
  restaurantId,
}: {
  restaurantId: number
}) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const cart = useCartStore((s) => s.cart)
  const loading = useCartStore((s) => s.loading)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)
  const pickupOffsetMinutes = useCartStore((s) => s.pickupOffsetMinutes)
  const setPickupOffset = useCartStore((s) => s.setPickupOffset)

  if (!user || user.role !== 'customer') return null

  // Cart may belong to a different restaurant. For this restaurant page we
  // only render items if restaurant_id matches.
  const belongsHere =
    cart && cart.restaurant_id !== null && cart.restaurant_id === restaurantId
  const items: CartItem[] = belongsHere ? cart!.items : []
  const subtotal = belongsHere ? cart!.subtotal : 0
  const isEmpty = items.length === 0

  return (
    <aside className="w-[280px] shrink-0 rounded-2xl bg-[#FAFAFA] p-4 flex flex-col gap-4 self-start sticky top-24">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#0C0310]">Корзина</h2>
        {!isEmpty && (
          <button
            type="button"
            onClick={() => clear()}
            className="text-xs text-[#8C8C8C] hover:text-[#0C0310]"
          >
            Очистить
          </button>
        )}
      </header>

      {loading && !cart && <Spinner />}

      {!loading && isEmpty && (
        <div className="flex-1 flex items-center justify-center py-16 text-sm text-[#8C8C8C] text-center px-4">
          В вашей корзине пока пусто
        </div>
      )}

      {!isEmpty && (
        <>
          <ul className="flex flex-col gap-3">
            {items.map((it) => (
              <li key={it.menu_item_id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#E5E5E5] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#0C0310] truncate">
                    {it.name}
                  </div>
                  <div className="text-xs text-[#8C8C8C]">
                    {formatPrice(it.price)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={
                      it.quantity === 1 ? 'Убрать блюдо' : 'Уменьшить количество'
                    }
                    onClick={() =>
                      it.quantity === 1
                        ? remove(it.menu_item_id)
                        : updateQuantity(it.menu_item_id, it.quantity - 1)
                    }
                    className="w-7 h-7 rounded-lg bg-white border border-[#E5E5E5] text-[#0C0310] hover:bg-[#F0F0F0]"
                  >
                    −
                  </button>
                  <span className="text-sm text-[#0C0310] tabular-nums w-4 text-center">
                    {it.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Увеличить количество"
                    onClick={() =>
                      updateQuantity(it.menu_item_id, it.quantity + 1)
                    }
                    className="w-7 h-7 rounded-lg bg-white border border-[#E5E5E5] text-[#0C0310] hover:bg-[#F0F0F0]"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-[#E5E5E5] pt-3 flex items-center justify-between">
            <span className="text-sm text-[#8C8C8C]">Итого в заказе</span>
            <span className="text-sm font-semibold text-[#0C0310]">
              {formatPrice(subtotal)}
            </span>
          </div>

          <label className="flex flex-col gap-1 text-xs text-[#8C8C8C]">
            Время самовывоза
            <select
              value={pickupOffsetMinutes}
              onChange={(e) => setPickupOffset(Number(e.target.value))}
              className="h-10 rounded-xl border border-[#E5E5E5] bg-white px-3 text-sm text-[#0C0310] focus:outline-none focus:border-[#FF7700]"
            >
              {PICKUP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="w-full h-11 rounded-xl bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56B00]"
          >
            Далее
          </button>
        </>
      )}
    </aside>
  )
}
