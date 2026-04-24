import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useRestaurant } from '../hooks/useRestaurant'
import PaymentMethodModal, {
  type PaymentMethod,
} from '../components/PaymentMethodModal'
import type { CartItem } from '../types/cart'

const PAYMENT_LABEL: Record<PaymentMethod, { icon: string; label: string }> = {
  card_online: { icon: '💳', label: 'Карта ****77' },
  cash_on_receipt: { icon: '💵', label: 'Наличные при получении' },
}

const formatPrice = (rub: number) =>
  rub.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const cart = useCartStore((s) => s.cart)
  const loading = useCartStore((s) => s.loading)
  const clear = useCartStore((s) => s.clear)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const remove = useCartStore((s) => s.remove)

  const restaurantId = cart?.restaurant_id ?? null
  const { data: restaurant } = useRestaurant(restaurantId)

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('card_online')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [cutlery, setCutlery] = useState(false)

  // Customers only — owners/admins shouldn't reach checkout
  if (user && user.role !== 'customer') return <Navigate to="/" replace />

  // Wait for cart to load before deciding to redirect
  if (loading && !cart) {
    return <div className="text-sm text-[#8C8C8C]">Загрузка…</div>
  }

  // Empty cart → nothing to checkout
  if (!cart || cart.items.length === 0 || cart.restaurant_id == null) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[#0C0310]">
        {restaurant?.name ?? 'Оформление заказа'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col gap-6">
          <PickupConditionsCard
            address={restaurant?.pickup_address ?? '—'}
            prepMin={restaurant?.preparation_time_min ?? null}
            prepMax={restaurant?.preparation_time_max ?? null}
            isPremium={!!user?.is_premium}
          />
          <YourOrderCard
            items={cart.items}
            cutlery={cutlery}
            onToggleCutlery={() => setCutlery((v) => !v)}
            onClear={() => clear()}
            onInc={(id, q) => updateQuantity(id, q + 1)}
            onDec={(id, q) =>
              q === 1 ? remove(id) : updateQuantity(id, q - 1)
            }
          />
          <CommentCard value={comment} onChange={setComment} />
        </div>

        <div className="flex flex-col gap-6">
          <PaymentAndTotalCard
            subtotal={cart.subtotal}
            isPremium={!!user?.is_premium}
            paymentMethod={paymentMethod}
            onChangePayment={() => setPaymentOpen(true)}
            onPay={() => {
              // TODO FE-3.2.5
              navigate('/orders')
            }}
          />
        </div>
      </div>

      <PaymentMethodModal
        open={paymentOpen}
        value={paymentMethod}
        onClose={() => setPaymentOpen(false)}
        onSelect={setPaymentMethod}
      />
    </div>
  )
}

function PickupConditionsCard({
  address,
  prepMin,
  prepMax,
  isPremium,
}: {
  address: string
  prepMin: number | null
  prepMax: number | null
  isPremium: boolean
}) {
  const prepLabel =
    prepMin != null && prepMax != null
      ? `${prepMin}-${prepMax} минут`
      : prepMin != null
        ? `${prepMin} минут`
        : '—'

  return (
    <section className="rounded-2xl bg-[#FAFAFA] p-5 flex flex-col gap-4">
      <h2 className="text-base font-semibold text-[#0C0310]">
        Условия самовывоза
      </h2>

      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl bg-white border border-[#E5E5E5] px-4 py-2 text-sm text-[#0C0310]">
          Стандарт
        </div>
        <div
          className={
            'rounded-xl border px-4 py-2 text-sm ' +
            (isPremium
              ? 'bg-white border-[#FF7700] text-[#0C0310]'
              : 'bg-white border-[#E5E5E5] text-[#8C8C8C]')
          }
          title={
            isPremium
              ? 'Доступно по подписке Студент+'
              : 'Доступно с подпиской Студент+'
          }
        >
          Приоритетное приготовление
        </div>
      </div>

      <div className="flex items-start gap-2 text-sm text-[#0C0310]">
        <span aria-hidden>📍</span>
        <span>{address}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-[#0C0310]">
          Время приготовления
        </span>
        <span className="text-sm text-[#8C8C8C]">{prepLabel}</span>
      </div>
    </section>
  )
}

function YourOrderCard({
  items,
  cutlery,
  onToggleCutlery,
  onClear,
  onInc,
  onDec,
}: {
  items: CartItem[]
  cutlery: boolean
  onToggleCutlery: () => void
  onClear: () => void
  onInc: (id: number, q: number) => void
  onDec: (id: number, q: number) => void
}) {
  return (
    <section className="rounded-2xl bg-[#FAFAFA] p-5 flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#0C0310]">Ваш заказ</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-[#8C8C8C] hover:text-[#0C0310]"
        >
          Очистить корзину
        </button>
      </header>

      <button
        type="button"
        onClick={onToggleCutlery}
        aria-pressed={cutlery}
        className={
          'self-start rounded-xl border px-4 py-2 text-sm transition ' +
          (cutlery
            ? 'bg-[#FF7700] border-[#FF7700] text-white hover:bg-[#E56B00]'
            : 'bg-white border-[#E5E5E5] text-[#0C0310] hover:bg-[#F0F0F0]')
        }
      >
        Положить приборы
      </button>

      <ul className="flex flex-col gap-3">
        {items.map((it) => (
          <li key={it.menu_item_id} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#E5E5E5] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#0C0310] truncate">{it.name}</div>
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
                onClick={() => onDec(it.menu_item_id, it.quantity)}
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
                onClick={() => onInc(it.menu_item_id, it.quantity)}
                className="w-7 h-7 rounded-lg bg-white border border-[#E5E5E5] text-[#0C0310] hover:bg-[#F0F0F0]"
              >
                +
              </button>
            </div>
            <div className="text-sm text-[#0C0310] w-20 text-right">
              {formatPrice(it.subtotal)}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CommentCard({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <section className="rounded-2xl bg-[#FAFAFA] p-5 flex flex-col gap-3">
      <h2 className="text-base font-semibold text-[#0C0310] text-center">
        Комментарий к заказу
      </h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Без лука, положите приборы…"
        rows={3}
        maxLength={500}
        className="w-full rounded-xl border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#0C0310] focus:outline-none focus:border-[#FF7700]"
      />
    </section>
  )
}

function PaymentAndTotalCard({
  subtotal,
  isPremium,
  paymentMethod,
  onChangePayment,
  onPay,
}: {
  subtotal: number
  isPremium: boolean
  paymentMethod: PaymentMethod
  onChangePayment: () => void
  onPay: () => void
}) {
  const pm = PAYMENT_LABEL[paymentMethod]
  // Subscription discount: backend применит max(promo, subscription).
  // На этом подшаге показываем только подписочную, без промокода.
  const subscriptionDiscount = isPremium ? Math.round(subtotal * 0.05) : 0
  const total = subtotal - subscriptionDiscount

  return (
    <section className="rounded-2xl bg-[#FAFAFA] p-5 flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#0C0310]">
          Способ оплаты
        </h2>
        <button
          type="button"
          onClick={onChangePayment}
          className="rounded-full bg-white border border-[#E5E5E5] px-4 py-1.5 text-xs text-[#0C0310] hover:bg-[#F0F0F0]"
        >
          Изменить
        </button>
      </header>

      <div className="flex items-center gap-3 text-sm text-[#0C0310]">
        <span aria-hidden>{pm.icon}</span>
        <span>{pm.label}</span>
      </div>

      <div className="border-t border-[#E5E5E5] pt-4 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-[#0C0310]">Что в цене</h3>
        <div className="flex justify-between text-sm text-[#0C0310]">
          <span>Товары в заказе</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {isPremium && (
          <div className="flex justify-between text-sm text-[#0C0310]">
            <span>Скидка по подписке Студент+</span>
            <span>−{formatPrice(subscriptionDiscount)}</span>
          </div>
        )}
      </div>

      <input
        type="text"
        placeholder="У меня есть промокод"
        disabled
        className="w-full h-11 rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#0C0310] focus:outline-none focus:border-[#FF7700] disabled:bg-[#F5F5F5]"
        // TODO FE-3.2.4
      />

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPay}
          className="flex-1 h-11 rounded-xl bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56B00]"
        >
          Оплатить
        </button>
        <span className="text-base font-semibold text-[#0C0310] tabular-nums">
          {formatPrice(total)}
        </span>
      </div>
    </section>
  )
}
