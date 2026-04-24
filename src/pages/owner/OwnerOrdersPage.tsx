import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnerOrders } from '../../api/ownerOrders'
import type {
  OwnerActiveStatus,
  OwnerOrderListItem,
} from '../../types/order'

interface ColumnConfig {
  status: OwnerActiveStatus
  title: string
  hint: string
}

const COLUMNS: ColumnConfig[] = [
  { status: 'created', title: 'Новые', hint: 'Принять в работу' },
  { status: 'cooking', title: 'Готовятся', hint: 'Когда блюдо готово' },
  {
    status: 'ready_for_pickup',
    title: 'Ждут выдачи',
    hint: 'Передано клиенту',
  },
]

const formatTime = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mi}`
}

interface ColumnState {
  loading: boolean
  error: string | null
  items: OwnerOrderListItem[]
}

const emptyColumn = (): ColumnState => ({
  loading: false,
  error: null,
  items: [],
})

export default function OwnerOrdersPage() {
  const [columns, setColumns] = useState<Record<OwnerActiveStatus, ColumnState>>({
    created: emptyColumn(),
    cooking: emptyColumn(),
    ready_for_pickup: emptyColumn(),
  })

  const loadColumn = useCallback(async (status: OwnerActiveStatus) => {
    setColumns((c) => ({
      ...c,
      [status]: { ...c[status], loading: true, error: null },
    }))
    try {
      const res = await getOwnerOrders({ status, limit: 50 })
      setColumns((c) => ({
        ...c,
        [status]: { loading: false, error: null, items: res.items },
      }))
    } catch {
      setColumns((c) => ({
        ...c,
        [status]: {
          loading: false,
          error: 'Не удалось загрузить',
          items: [],
        },
      }))
    }
  }, [])

  useEffect(() => {
    COLUMNS.forEach((c) => loadColumn(c.status))
  }, [loadColumn])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#0C0310]">Заказы</h1>
        <Link
          to="/owner/orders/history"
          className="text-sm text-[#FF7700] hover:underline"
        >
          История заказов →
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            config={col}
            state={columns[col.status]}
          />
        ))}
      </div>
    </div>
  )
}

function KanbanColumn({
  config,
  state,
}: {
  config: ColumnConfig
  state: ColumnState
}) {
  return (
    <section className="rounded-2xl bg-white border border-[#E5E5E5] p-4 flex flex-col gap-3 min-h-[200px]">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#0C0310]">
          {config.title}
        </h2>
        <span className="text-xs text-[#8C8C8C] tabular-nums">
          {state.items.length}
        </span>
      </header>

      {state.loading && (
        <div className="text-xs text-[#8C8C8C]">Загрузка…</div>
      )}
      {state.error && !state.loading && (
        <div className="text-xs text-red-600" role="alert">
          {state.error}
        </div>
      )}
      {!state.loading && !state.error && state.items.length === 0 && (
        <div className="text-xs text-[#8C8C8C]">Пусто</div>
      )}

      <ul className="flex flex-col gap-3">
        {state.items.map((o) => (
          <li key={o.id}>
            <OwnerOrderCardLite order={o} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function OwnerOrderCardLite({ order }: { order: OwnerOrderListItem }) {
  return (
    <article
      className={
        'rounded-xl bg-[#FAFAFA] p-3 flex flex-col gap-1 border ' +
        (order.is_premium_client ? 'border-[#FF7700]' : 'border-transparent')
      }
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
    </article>
  )
}
