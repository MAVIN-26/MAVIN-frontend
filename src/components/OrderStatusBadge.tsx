import type { OrderStatus } from '../types/order'

const CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string }
> = {
  created: { label: 'Создан', bg: 'bg-[#FFF1E0]', text: 'text-[#FF7700]' },
  cooking: { label: 'Готовится', bg: 'bg-[#FFE5C2]', text: 'text-[#B85A00]' },
  ready_for_pickup: {
    label: 'Можно забирать',
    bg: 'bg-[#E0F5E5]',
    text: 'text-[#1F8A3A]',
  },
  completed: { label: 'Завершён', bg: 'bg-[#E5E5E5]', text: 'text-[#3C3C3C]' },
  cancelled: {
    label: 'Отменён',
    bg: 'bg-[#FBE3E3]',
    text: 'text-[#C13E3E]',
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
