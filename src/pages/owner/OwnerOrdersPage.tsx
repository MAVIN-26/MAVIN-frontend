import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnerOrders } from '../../api/ownerOrders'
import OwnerOrderCard from '../../components/owner/OwnerOrderCard'
import type {
  OwnerActiveStatus,
  OwnerOrderListItem,
} from '../../types/order'

const NEXT_STATUS: Record<OwnerActiveStatus, OwnerActiveStatus | null> = {
  created: 'cooking',
  cooking: 'ready_for_pickup',
  ready_for_pickup: null,
}

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

  const handleTransitioned = useCallback(
    (_orderId: number, fromStatus: OwnerActiveStatus) => {
      // Refresh source and destination columns; backend is the source of truth.
      loadColumn(fromStatus)
      const next = NEXT_STATUS[fromStatus]
      if (next) loadColumn(next)
    },
    [loadColumn],
  )

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
            onTransitioned={handleTransitioned}
          />
        ))}
      </div>
    </div>
  )
}

function KanbanColumn({
  config,
  state,
  onTransitioned,
}: {
  config: ColumnConfig
  state: ColumnState
  onTransitioned: (orderId: number, fromStatus: OwnerActiveStatus) => void
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
            <OwnerOrderCard order={o} onTransitioned={onTransitioned} />
          </li>
        ))}
      </ul>
    </section>
  )
}
