import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { getOrders, reviewOrder } from '../api/orders'
import { useOrder } from '../hooks/useOrder'
import OrderDetailsPanel from '../components/OrderDetailsPanel'
import OrderStatusBadge from '../components/OrderStatusBadge'
import Spinner from '../components/Spinner'
import StarRating from '../components/StarRating'
import { toast } from '../store/toastStore'
import { getReview, saveReview } from '../utils/orderReviews'
import type { OrderListItem } from '../types/order'

const formatPrice = (rub: number) =>
  rub.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽'

const formatDateTime = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm}.${yy} ${hh}:${mi}`
}

export default function OrdersPage() {
  const [params, setParams] = useSearchParams()
  const selectedId = useMemo(() => {
    const raw = params.get('order')
    return raw ? Number(raw) : null
  }, [params])

  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const detail = useOrder(selectedId)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getOrders({ limit: 50 })
      .then((res) => {
        if (cancelled) return
        setOrders(res.items)
      })
      .catch(() => {
        if (cancelled) return
        setError('Не удалось загрузить заказы')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const handleSelect = (id: number) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('order', String(id))
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[#0C0310]">Мои заказы</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        <aside className="flex flex-col gap-3">
          {loading && <Spinner />}
          {error && !loading && (
            <div className="text-sm text-red-600" role="alert">
              {error}
            </div>
          )}
          {!loading && !error && orders.length === 0 && (
            <div className="text-sm text-[#8C8C8C]">У вас пока нет заказов</div>
          )}
          {orders.map((o) => (
            <OrderListCard
              key={o.id}
              order={o}
              selected={o.id === selectedId}
              onClick={() => handleSelect(o.id)}
            />
          ))}
        </aside>

        <section className="min-h-[200px]">
          {selectedId == null && orders.length > 0 && (
            <div className="rounded-2xl bg-[#FAFAFA] p-6">
              <p className="text-sm text-[#8C8C8C]">
                Выберите заказ слева, чтобы увидеть детали.
              </p>
            </div>
          )}
          {selectedId != null && detail.loading && (
            <div className="rounded-2xl bg-[#FAFAFA] p-6">
              <Spinner />
            </div>
          )}
          {selectedId != null && detail.error && !detail.loading && (
            <div
              className="rounded-2xl bg-[#FAFAFA] p-6 text-sm text-red-600"
              role="alert"
            >
              {detail.error}
            </div>
          )}
          {detail.data && (
            <OrderDetailsPanel
              order={detail.data}
              onCancelled={() => {
                detail.refresh()
                setReloadKey((k) => k + 1)
              }}
            />
          )}
        </section>
      </div>
    </div>
  )
}

function OrderListCard({
  order,
  selected,
  onClick,
}: {
  order: OrderListItem
  selected: boolean
  onClick: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={
        'text-left rounded-2xl border bg-white px-4 py-3 transition cursor-pointer ' +
        (selected
          ? 'border-[#FF7700] shadow-sm'
          : 'border-[#E5E5E5] hover:border-[#FFBA7D]')
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-col gap-1">
          <span className="text-sm font-semibold text-[#0C0310] truncate">
            {order.restaurant_name}
          </span>
          <span className="text-xs text-[#8C8C8C]">
            {formatDateTime(order.created_at)}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
        <span className="text-sm font-semibold text-[#0C0310] tabular-nums shrink-0">
          {formatPrice(order.total)}
        </span>
      </div>
      {order.status === 'completed' && (
        <div onClick={(e) => e.stopPropagation()}>
          <CardRating orderId={order.id} />
        </div>
      )}
    </div>
  )
}

function CardRating({ orderId }: { orderId: number }) {
  const [rating, setRating] = useState<number>(() => getReview(orderId) ?? 0)
  const [submitted, setSubmitted] = useState<boolean>(
    () => getReview(orderId) != null,
  )
  const [submitting, setSubmitting] = useState(false)

  const handleRate = async (value: number) => {
    if (submitting || submitted) return
    setRating(value)
    setSubmitting(true)
    try {
      await reviewOrder(orderId, value)
      saveReview(orderId, value)
      setSubmitted(true)
      toast.success('Спасибо за оценку!')
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 422) {
        toast.error('Заказ ещё не завершён')
      } else {
        toast.error('Не удалось сохранить оценку')
      }
      setRating(0)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-[#E5E5E5] flex items-center gap-2">
      <StarRating
        value={rating}
        onChange={handleRate}
        readOnly={submitted}
        disabled={submitting}
        size={18}
      />
      <span className="text-xs text-[#8C8C8C]">
        {submitted ? `Отзыв оставлен ★ ${rating}` : 'Оставить отзыв'}
      </span>
    </div>
  )
}
