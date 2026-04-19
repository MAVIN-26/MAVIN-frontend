import { useEffect, useState } from 'react'
import { getAdminStats } from '../../api/adminStats'
import type { AdminStats } from '../../types/adminStats'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAdminStats()
      .then((data) => {
        if (cancelled) return
        setStats(data)
        setError(null)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const message =
          e instanceof Error ? e.message : 'Не удалось загрузить статистику'
        setError(message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Заказов сегодня:"
          value={stats ? stats.orders_today.toLocaleString('ru-RU') : null}
          loading={loading}
        />
        <StatCard
          title="Общая выручка:"
          value={stats ? `${formatMoney(stats.revenue_total)}р` : null}
          loading={loading}
        />
        <StatCard
          title="Активных подписок Студент+:"
          value={
            stats ? stats.active_subscriptions_count.toLocaleString('ru-RU') : null
          }
          loading={loading}
        />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  loading,
}: {
  title: string
  value: string | null
  loading: boolean
}) {
  return (
    <div className="bg-[#ECECEC] rounded-2xl px-8 py-10 min-h-[220px] flex flex-col items-center justify-center text-center">
      <div className="text-lg text-[#0C0310] mb-6">{title}</div>
      <div className="text-4xl font-semibold text-[#0C0310]">
        {loading ? '…' : value ?? '—'}
      </div>
    </div>
  )
}

// Plain RU integer formatting — revenue is "500000р" in design (no decimals).
function formatMoney(v: number) {
  return Math.round(v).toLocaleString('ru-RU').replace(/\u00a0/g, '')
}
