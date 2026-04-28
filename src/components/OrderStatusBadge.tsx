import type { OrderStatus } from '../types/order'

const CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string }
> = {
  created: { label: 'Создан', bg: 'bg-[#FFBA7D]', text: 'text-[#FF7700]' },
  cooking: { label: 'Готовится', bg: 'bg-[#FFBA7D]', text: 'text-[#E56A00]' },
  ready_for_pickup: {
    label: 'Можно забирать',
    bg: 'bg-[#EFFFD4]',
    text: 'text-[#CCFF53]',
  },
  completed: { label: 'Завершён', bg: 'bg-[#E5E5E5]', text: 'text-[#3C3C3C]' },
  cancelled: {
    label: 'Отменён',
    bg: 'bg-[#FFD4D4]',
    text: 'text-[#FF5757]',
  },
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const c = CONFIG[status]
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${c.bg} ${c.text}`}
    >
      {c.label}
    </span>
  )
}
