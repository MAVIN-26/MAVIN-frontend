import { useState } from 'react'
import {
  acceptOwnerOrder,
  completeOwnerOrder,
  getOwnerOrder,
  markOwnerOrderReady,
} from '../../api/ownerOrders'
import { toast } from '../../store/toastStore'
import type {
  OwnerActiveStatus,
  OwnerOrderDetail,
  OwnerOrderListItem,
} from '../../types/order'

const formatTime = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mi}`
}

const ACTION_LABEL: Record<OwnerActiveStatus, string> = {
  created: 'Принять в работу',
  cooking: 'Готово к выдаче',
  ready_for_pickup: 'Выдан клиенту',
}

interface Props {
  order: OwnerOrderListItem
  onTransitioned: (orderId: number, fromStatus: OwnerActiveStatus) => void
}

export default function OwnerOrderCard({ order, onTransitioned }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<OwnerOrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [acting, setActing] = useState(false)

  const status = order.status as OwnerActiveStatus

  const handleToggle = async () => {
    const next = !expanded
    setExpanded(next)
    if (next && !detail && !detailLoading) {
      setDetailLoading(true)
      setDetailError(null)
      try {
        const data = await getOwnerOrder(order.id)
        setDetail(data)
      } catch {
        setDetailError('Не удалось загрузить детали')
      } finally {
        setDetailLoading(false)
      }
    }
  }

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (acting) return
    setActing(true)
    try {
      if (status === 'created') {
        await acceptOwnerOrder(order.id)
        toast.success(`Заказ #${order.id} принят в работу`)
      } else if (status === 'cooking') {
        await markOwnerOrderReady(order.id)
        toast.success(`Заказ #${order.id} готов к выдаче`)
      } else {
        await completeOwnerOrder(order.id)
        toast.success(`Заказ #${order.id} выдан клиенту`)
      }
      onTransitioned(order.id, status)
    } catch {
      toast.error('Не удалось обновить статус')
    } finally {
      setActing(false)
    }
  }

  return (
    <article
      className={
        'rounded-xl bg-[#FAFAFA] flex flex-col border ' +
        (order.is_premium_client ? 'border-[#FF7700]' : 'border-transparent')
      }
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={expanded}
        className="text-left px-3 pt-3 pb-2 flex flex-col gap-1 hover:bg-[#F2F2F2] rounded-t-xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#0C0310]">
            #{order.id}
          </span>
          {order.is_premium_client && (
            <span className="text-[10px] font-semibold text-[#FF7700] uppercase tracking-wide">
              Студент+
            </span>
          )}
        </div>
        <div className="text-xs text-[#0C0310]">{order.customer_name}</div>
        <div className="text-xs text-[#8C8C8C]">
          Самовывоз: {formatTime(order.pickup_time)}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-2 flex flex-col gap-2 border-t border-[#E5E5E5] pt-2">
          {detailLoading && (
            <div className="text-xs text-[#8C8C8C]">Загрузка деталей…</div>
          )}
          {detailError && !detailLoading && (
            <div className="text-xs text-red-600" role="alert">
              {detailError}
            </div>
          )}
          {detail && (
            <>
              <div className="text-xs text-[#8C8C8C]">
                Тел: {detail.customer_phone}
              </div>
              <ul className="flex flex-col gap-1">
                {detail.items.map((it) => (
                  <li
                    key={it.menu_item_id}
                    className="flex justify-between text-xs text-[#0C0310]"
                  >
                    <span className="truncate">{it.name}</span>
                    <span className="text-[#8C8C8C] tabular-nums shrink-0 ml-2">
                      ×{it.quantity}
                    </span>
                  </li>
                ))}
              </ul>
              {detail.comment && (
                <div className="text-xs text-[#3C3C3C] bg-white rounded-lg p-2 border border-[#E5E5E5]">
                  <span className="font-semibold">Комментарий: </span>
                  {detail.comment}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="px-3 pb-3 pt-2">
        <button
          type="button"
          onClick={handleAction}
          disabled={acting}
          className="w-full h-9 rounded-lg bg-[#FF7700] text-white text-xs font-semibold hover:bg-[#E56A00] disabled:opacity-60"
        >
          {acting ? 'Обновляем…' : ACTION_LABEL[status]}
        </button>
      </div>
    </article>
  )
}
