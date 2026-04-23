import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import type { CartItem } from '../types/cart'

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
  const user = useAuthStore((s) => s.user)
  const cart = useCartStore((s) => s.cart)
  const loading = useCartStore((s) => s.loading)

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
            className="text-xs text-[#8C8C8C] hover:text-[#0C0310]"
          >
            Очистить
          </button>
        )}
      </header>

      {loading && !cart && (
        <div className="text-sm text-[#8C8C8C]">Загрузка…</div>
      )}

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
                <div className="text-sm text-[#0C0310] tabular-nums">
                  × {it.quantity}
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

          <button
            type="button"
            className="w-full h-11 rounded-xl bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56B00]"
          >
            Далее
          </button>
        </>
      )}
    </aside>
  )
}
