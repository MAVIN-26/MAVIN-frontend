import { useState } from 'react'
import axios from 'axios'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useRestaurant } from '../hooks/useRestaurant'
import PaymentMethodModal, {
  type PaymentMethod,
} from '../components/PaymentMethodModal'
import Modal from '../components/Modal'
import { validatePromo } from '../api/promo'
import { createOrder } from '../api/orders'
import { toast } from '../store/toastStore'
import type { CartItem } from '../types/cart'
import type { PromoCode } from '../types/promo'

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
  const pickupOffsetMinutes = useCartStore((s) => s.pickupOffsetMinutes)
  const fetchCart = useCartStore((s) => s.fetch)

  const restaurantId = cart?.restaurant_id ?? null
  const { data: restaurant } = useRestaurant(restaurantId)

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('card_online')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [cutlery, setCutlery] = useState(false)
  const [promo, setPromo] = useState<PromoCode | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [unavailableOpen, setUnavailableOpen] = useState(false)

  const handlePay = async () => {
    if (submitting) return
    const finalComment = [cutlery ? 'Положите приборы.' : '', comment.trim()]
      .filter(Boolean)
      .join(' ')
      .trim()
    const pickupTime = new Date(
      Date.now() + pickupOffsetMinutes * 60_000,
    ).toISOString()

    setSubmitting(true)
    try {
      const order = await createOrder({
        pickup_time: pickupTime,
        comment: finalComment || undefined,
        payment_method: paymentMethod,
        promo_code: promo?.code,
      })
      // Backend очищает корзину после оформления — синхронизируем локальный стор.
      await fetchCart()
      toast.success('Заказ оформлен')
      navigate(`/orders?order=${order.id}`)
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 409) {
          // Блюдо закончилось — показать модалку, освежить корзину.
          setUnavailableOpen(true)
          fetchCart()
        } else if (e.response?.status === 404) {
          // Промокод не найден/истёк — снять и предупредить.
          setPromo(null)
          toast.error('Промокод не найден или истёк')
        } else {
          toast.error('Не удалось оформить заказ')
        }
      } else {
        toast.error('Не удалось оформить заказ')
      }
    } finally {
      setSubmitting(false)
    }
  }

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
            promo={promo}
            onApplyPromo={setPromo}
            onClearPromo={() => setPromo(null)}
            onPay={handlePay}
            submitting={submitting}
          />
        </div>
      </div>

      <PaymentMethodModal
        open={paymentOpen}
        value={paymentMethod}
        onClose={() => setPaymentOpen(false)}
        onSelect={setPaymentMethod}
      />

      <Modal
        open={unavailableOpen}
        title="Блюдо закончилось"
        onClose={() => setUnavailableOpen(false)}
        maxWidth="sm"
      >
        <p className="text-sm text-[#3C3C3C]">
          К сожалению, одно из блюд из вашей корзины больше недоступно.
          Корзина обновлена — пожалуйста, проверьте состав заказа.
        </p>
        <div className="flex justify-end pt-5">
          <button
            type="button"
            onClick={() => setUnavailableOpen(false)}
            className="px-5 py-2 rounded-full bg-[#FF7700] hover:bg-[#E66A00] text-white text-sm font-medium"
          >
            Понятно
          </button>
        </div>
      </Modal>
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
  promo,
  onApplyPromo,
  onClearPromo,
  onPay,
  submitting,
}: {
  subtotal: number
  isPremium: boolean
  paymentMethod: PaymentMethod
  onChangePayment: () => void
  promo: PromoCode | null
  onApplyPromo: (p: PromoCode) => void
  onClearPromo: () => void
  onPay: () => void
  submitting: boolean
}) {
  const pm = PAYMENT_LABEL[paymentMethod]

  // Backend применит наибольшую скидку (promo vs subscription 5%); UI должен
  // отражать ту же логику, чтобы итог совпадал с сервером.
  const subscriptionPct = isPremium ? 5 : 0
  const promoPct = promo?.discount_percent ?? 0
  const effectivePct = Math.max(subscriptionPct, promoPct)
  const totalDiscount = Math.round((subtotal * effectivePct) / 100)
  const total = subtotal - totalDiscount

  const showPromoLine = promoPct > 0 && promoPct >= subscriptionPct
  const showSubLine = subscriptionPct > 0 && !showPromoLine

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
        {showSubLine && (
          <div className="flex justify-between text-sm text-[#0C0310]">
            <span>Скидка по подписке Студент+ ({subscriptionPct}%)</span>
            <span>−{formatPrice(totalDiscount)}</span>
          </div>
        )}
        {showPromoLine && (
          <div className="flex justify-between text-sm text-[#0C0310]">
            <span>
              Промокод {promo?.code} ({promoPct}%)
            </span>
            <span>−{formatPrice(totalDiscount)}</span>
          </div>
        )}
      </div>

      <PromoField
        promo={promo}
        onApply={onApplyPromo}
        onClear={onClearPromo}
      />

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPay}
          disabled={submitting}
          className="flex-1 h-11 rounded-xl bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56B00] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Оформляем…' : 'Оплатить'}
        </button>
        <span className="text-base font-semibold text-[#0C0310] tabular-nums">
          {formatPrice(total)}
        </span>
      </div>
    </section>
  )
}

function PromoField({
  promo,
  onApply,
  onClear,
}: {
  promo: PromoCode | null
  onApply: (p: PromoCode) => void
  onClear: () => void
}) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    const trimmed = code.trim()
    if (!trimmed || loading) return
    setLoading(true)
    setError(null)
    try {
      const result = await validatePromo(trimmed)
      onApply(result)
      setCode('')
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        setError('Промокод не найден или истёк')
      } else {
        setError('Не удалось проверить промокод')
      }
    } finally {
      setLoading(false)
    }
  }

  if (promo) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#FF7700] bg-white px-4 py-2.5">
        <div className="text-sm text-[#0C0310]">
          Промокод <span className="font-semibold">{promo.code}</span> применён
          (−{promo.discount_percent}%)
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-[#8C8C8C] hover:text-[#0C0310]"
        >
          Убрать
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleApply()
            }
          }}
          placeholder="У меня есть промокод"
          className="flex-1 h-11 rounded-xl border border-[#E5E5E5] bg-white px-4 text-sm text-[#0C0310] focus:outline-none focus:border-[#FF7700]"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || code.trim().length === 0}
          className="h-11 px-4 rounded-xl bg-white border border-[#E5E5E5] text-sm text-[#0C0310] hover:bg-[#F0F0F0] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '…' : 'Применить'}
        </button>
      </div>
      {error && (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
