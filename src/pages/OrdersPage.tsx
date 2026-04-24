import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getOrders } from '../api/orders'
import type { OrderListItem, OrderStatus } from '../types/order'

const STATUS_LABEL: Record<OrderStatus, string> = {
  created: 'Создан',
  cooking: 'Готовится',
  ready_for_pickup: 'Можно забирать',
  completed: 'Завершён',
  cancelled: 'Отменён',
}

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
  }, [])

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
          {loading && (
            <div className="text-sm text-[#8C8C8C]">Загрузка…</div>
          )}
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

        <section className="rounded-2xl bg-[#FAFAFA] p-6 min-h-[200px]">
          {selectedId == null ? (
            <p className="text-sm text-[#8C8C8C]">
              Выберите заказ слева, чтобы увидеть детали.
            </p>
          ) : (
            <p className="text-sm text-[#8C8C8C]">
              Заказ #{selectedId} — детали (FE-3.3.2)
            </p>
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
    <button
      type="button"
      onClick={onClick}
      className={
        'text-left rounded-2xl border bg-white px-4 py-3 transition ' +
        (selected
          ? 'border-[#FF7700] shadow-sm'
          : 'border-[#E5E5E5] hover:border-[#FFB266]')
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
          <span className="text-xs text-[#8C8C8C]">
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <span className="text-sm font-semibold text-[#0C0310] tabular-nums shrink-0">
          {formatPrice(order.total)}
        </span>
      </div>
    </button>
  )
}
