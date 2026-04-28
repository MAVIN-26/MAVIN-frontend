import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import Spinner from './Spinner'
import type { CartItem } from '../types/cart'
import type { MenuItemPublic } from '../types/menuItem'

const formatPrice = (rub: number) =>
  rub.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽'

export default function CartSidebar({
  restaurantId,
  menuItems = [],
}: {
  restaurantId: number
  menuItems?: MenuItemPublic[]
}) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const cart = useCartStore((s) => s.cart)
  const loading = useCartStore((s) => s.loading)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)

  const [kbjuOpen, setKbjuOpen] = useState(false)

  if (!user || user.role !== 'customer') return null

  const belongsHere =
    cart && cart.restaurant_id !== null && cart.restaurant_id === restaurantId
  const items: CartItem[] = belongsHere ? cart!.items : []
  const isEmpty = items.length === 0

  const menuMap = new Map(menuItems.map((m) => [m.id, m]))

  const totalKcal = items.reduce((sum, it) => {
    const mi = menuMap.get(it.menu_item_id)
    return sum + (mi?.calories ?? 0) * it.quantity
  }, 0)

  const totalProteins = items.reduce((sum, it) => {
    const mi = menuMap.get(it.menu_item_id)
    return sum + (mi?.proteins ?? 0) * it.quantity
  }, 0)

  const totalFats = items.reduce((sum, it) => {
    const mi = menuMap.get(it.menu_item_id)
    return sum + (mi?.fats ?? 0) * it.quantity
  }, 0)

  const totalCarbs = items.reduce((sum, it) => {
    const mi = menuMap.get(it.menu_item_id)
    return sum + (mi?.carbs ?? 0) * it.quantity
  }, 0)

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
            {items.map((it) => {
              const mi = menuMap.get(it.menu_item_id)
              return (
                <li key={it.menu_item_id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#E5E5E5] shrink-0 overflow-hidden">
                    {mi?.photo_url && (
                      <img
                        src={mi.photo_url}
                        alt={it.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#0C0310] truncate">
                      {it.name}
                    </div>
                    <div className="text-xs text-[#8C8C8C]">
                      {formatPrice(it.price)}
                      {mi?.weight_grams != null && ` · ${mi.weight_grams} г`}
                      {mi?.calories ? `  · ${Math.round(mi.calories * it.quantity)} ккал` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
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
                      className="w-7 h-7 rounded-lg bg-white border border-[#E5E5E5] text-[#0C0310] hover:bg-[#F0F0F0] flex items-center justify-center text-sm"
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
                      className="w-7 h-7 rounded-lg bg-white border border-[#E5E5E5] text-[#0C0310] hover:bg-[#F0F0F0] flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="border-t border-[#E5E5E5] pt-3 flex items-center justify-between relative">
            <span className="text-sm text-[#8C8C8C]">
              Итого в заказе:{' '}
              <span className="text-[#0C0310] font-medium">
                {Math.round(totalKcal)} ккал
              </span>
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setKbjuOpen((v) => !v)}
                className="text-xs font-medium text-[#FF7700] border border-[#FF7700] rounded-lg px-2 py-1 hover:bg-[#FFBA7D]"
              >
                КБЖУ
              </button>
              {kbjuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E5E5E5] rounded-xl shadow-md p-3 z-10">
                  <div className="text-xs font-medium text-[#0C0310] mb-2">
                    Из чего сложилась КБЖУ
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-[#3C3C3C]">
                    <div className="flex justify-between">
                      <span>Белки</span>
                      <span>{Math.round(totalProteins)} г</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Жиры</span>
                      <span>{Math.round(totalFats)} г</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Углеводы</span>
                      <span>{Math.round(totalCarbs)} г</span>
                    </div>
                    <div className="flex justify-between font-medium text-[#0C0310] border-t border-[#E5E5E5] pt-1 mt-1">
                      <span>Калории</span>
                      <span>{Math.round(totalKcal)} ккал</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="w-full h-11 rounded-xl bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56A00]"
          >
            Далее
          </button>
        </>
      )}
    </aside>
  )
}
