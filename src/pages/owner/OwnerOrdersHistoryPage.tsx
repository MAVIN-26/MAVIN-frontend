import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOwnerOrders } from '../../api/ownerOrders'
import type { OrderStatus, OwnerOrderListItem } from '../../types/order'

// План FE-3.6.4 — фильтр по статусу: completed / cancelled.
// Swagger /owner/orders ограничивает enum активными статусами; бэк должен
// расширить enum, чтобы вернуть архив. Если ответ пуст — увидим в работе.
type HistoryStatus = 'completed' | 'cancelled'

const STATUS_LABEL: Record<HistoryStatus, string> = {
  completed: 'Завершённые',
  cancelled: 'Отменённые',
}

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

const toDateInput = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function OwnerOrdersHistoryPage() {
  const [status, setStatus] = useState<HistoryStatus>('completed')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [items, setItems] = useState<OwnerOrderListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getOwnerOrders({ status: status as OrderStatus, limit: 100 })
      .then((res) => {
        if (cancelled) return
        setItems(res.items)
      })
      .catch(() => {
        if (cancelled) return
        setError('Не удалось загрузить историю')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [status])

  const filtered = useMemo(() => {
    if (!dateFrom && !dateTo) return items
    return items.filter((o) => {
      const day = toDateInput(o.pickup_time)
      if (!day) return false
      if (dateFrom && day < dateFrom) return false
      if (dateTo && day > dateTo) return false
      return true
    })
  }, [items, dateFrom, dateTo])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#0C0310]">
          История заказов
        </h1>
        <Link
          to="/owner/orders"
          className="text-sm text-[#FF7700] hover:underline"
        >
          ← К доске
        </Link>
      </header>

      <div className="flex flex-wrap items-end gap-3 bg-white border border-[#E5E5E5] rounded-2xl p-4">
        <label className="flex flex-col gap-1 text-xs text-[#8C8C8C]">
          Статус
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as HistoryStatus)}
            className="h-10 rounded-xl border border-[#E5E5E5] bg-white px-3 text-sm text-[#0C0310] focus:outline-none focus:border-[#FF7700]"
          >
            <option value="completed">{STATUS_LABEL.completed}</option>
            <option value="cancelled">{STATUS_LABEL.cancelled}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-[#8C8C8C]">
          С даты
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10 rounded-xl border border-[#E5E5E5] bg-white px-3 text-sm text-[#0C0310] focus:outline-none focus:border-[#FF7700]"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-[#8C8C8C]">
          По дату
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10 rounded-xl border border-[#E5E5E5] bg-white px-3 text-sm text-[#0C0310] focus:outline-none focus:border-[#FF7700]"
          />
        </label>

        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => {
              setDateFrom('')
              setDateTo('')
            }}
            className="h-10 px-4 rounded-xl bg-white border border-[#E5E5E5] text-sm text-[#0C0310] hover:bg-[#F0F0F0]"
          >
            Сбросить даты
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-[#8C8C8C]">Загрузка…</p>}
      {error && !loading && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#FAFAFA] text-xs text-[#8C8C8C] uppercase">
              <tr>
                <th className="text-left font-medium px-4 py-3">№</th>
                <th className="text-left font-medium px-4 py-3">Клиент</th>
                <th className="text-left font-medium px-4 py-3">Самовывоз</th>
                <th className="text-left font-medium px-4 py-3">Премиум</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-sm text-[#8C8C8C]"
                  >
                    Заказов не найдено
                  </td>
                </tr>
              )}
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-[#F0F0F0]">
                  <td className="px-4 py-3 font-semibold text-[#0C0310]">
                    #{o.id}
                  </td>
                  <td className="px-4 py-3 text-[#0C0310]">
                    {o.customer_name}
                  </td>
                  <td className="px-4 py-3 text-[#3C3C3C]">
                    {formatDateTime(o.pickup_time)}
                  </td>
                  <td className="px-4 py-3">
                    {o.is_premium_client && (
                      <span className="text-[10px] font-semibold text-[#FF7700] uppercase tracking-wide">
                        Студент+
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
