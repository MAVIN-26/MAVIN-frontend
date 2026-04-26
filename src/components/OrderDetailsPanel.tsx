import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import OrderStatusBadge from './OrderStatusBadge'
import ConfirmDialog from './ConfirmDialog'
import { cancelOrder } from '../api/orders'
import { toast } from '../store/toastStore'
import type { OrderDetail } from '../types/order'

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

interface Props {
  order: OrderDetail
  // restaurant_id не приходит в OrderDetail — для ссылки нужен внешний.
  restaurantId?: number | null
  onCancelled?: (id: number) => void
}

export default function OrderDetailsPanel({
  order,
  restaurantId,
  onCancelled,
}: Props) {
  const subtotal = order.items.reduce((s, it) => s + it.subtotal, 0)
  const total = order.total
  const discount = order.total_discount

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const handleCancel = async () => {
    if (cancelling) return
    setCancelling(true)
    try {
      await cancelOrder(order.id)
      toast.success('Заказ отменён')
      setConfirmOpen(false)
      onCancelled?.(order.id)
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 422) {
        toast.error('Заказ уже готовится, отмена невозможна')
      } else {
        toast.error('Не удалось отменить заказ')
      }
      setConfirmOpen(false)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <article className="rounded-2xl bg-[#FAFAFA] p-6 flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-[#0C0310]">
            Заказ #{order.id}
          </h2>
          <span className="text-xs text-[#8C8C8C]">
            {formatDateTime(order.created_at)}
          </span>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <div className="flex items-center justify-between gap-3 border-y border-[#E5E5E5] py-3">
        <span className="text-sm text-[#0C0310]">из {order.restaurant_name}</span>
        {restaurantId != null && (
          <Link
            to={`/restaurants/${restaurantId}`}
            className="text-sm text-[#FF7700] hover:underline"
          >
            Перейти →
          </Link>
        )}
      </div>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-[#0C0310]">Состав заказа</h3>
        <ul className="flex flex-col gap-2">
          {order.items.map((it) => (
            <li
              key={it.menu_item_id}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 text-sm text-[#0C0310]"
            >
              <span className="truncate">{it.name}</span>
              <span className="text-[#8C8C8C] tabular-nums">
                {formatPrice(it.price)}
              </span>
              <span className="text-[#8C8C8C] tabular-nums w-10 text-right">
                ×{it.quantity}
              </span>
              <span className="font-medium tabular-nums w-20 text-right">
                {formatPrice(it.subtotal)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2 border-t border-[#E5E5E5] pt-4">
        <h3 className="text-sm font-semibold text-[#0C0310]">Оплата</h3>
        <div className="flex justify-between text-sm text-[#0C0310]">
          <span>Стоимость товаров</span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-[#0C0310]">
          <span>Скидка</span>
          <span className="tabular-nums">
            {discount > 0 ? `−${formatPrice(discount)}` : formatPrice(0)}
          </span>
        </div>
        <div className="flex justify-between text-base font-semibold text-[#0C0310] pt-1">
          <span>Итого</span>
          <span className="tabular-nums">{formatPrice(total)}</span>
        </div>
      </section>

      {order.comment && (
        <section className="text-sm text-[#3C3C3C]">
          <span className="font-semibold text-[#0C0310]">Комментарий: </span>
          {order.comment}
        </section>
      )}

      {order.status === 'created' && (
        <div className="border-t border-[#E5E5E5] pt-4">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="px-5 py-2 rounded-full bg-white border border-[#E5E5E5] text-sm text-[#0C0310] hover:bg-[#F0F0F0]"
          >
            Отменить
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Отменить заказ?"
        message="Заказ будет отменён, и его нельзя будет восстановить."
        confirmLabel="Отменить заказ"
        cancelLabel="Назад"
        tone="danger"
        busy={cancelling}
        onConfirm={handleCancel}
        onClose={() => (cancelling ? null : setConfirmOpen(false))}
      />
    </article>
  )
}

