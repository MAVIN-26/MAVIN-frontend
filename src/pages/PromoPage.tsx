import { useEffect, useState } from 'react'
import { getPromoCodes } from '../api/promo'
import { toast } from '../store/toastStore'
import type { PromoCode } from '../types/promo'

const formatExpires = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `до ${d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`
}

export default function PromoPage() {
  const [items, setItems] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getPromoCodes({ limit: 50 })
      .then((res) => {
        if (cancelled) return
        setItems(res.items)
      })
      .catch(() => {
        if (cancelled) return
        setError('Не удалось загрузить промокоды')
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
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-[#0C0310]">Промокоды</h1>
        <p className="text-sm text-[#8C8C8C]">
          Скопируйте и вставьте код при оплате заказа
        </p>
      </header>

      {loading && <p className="text-sm text-[#8C8C8C]">Загрузка…</p>}

      {error && !loading && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl bg-[#FAFAFA] p-8 text-center text-sm text-[#8C8C8C]">
          Нет доступных промокодов
        </div>
      )}

      {items.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <li key={p.id}>
              <PromoCard promo={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PromoCard({ promo }: { promo: PromoCode }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promo.code)
      setCopied(true)
      toast.success('Код скопирован')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Не удалось скопировать код')
    }
  }

  return (
    <article className="rounded-2xl bg-[#FF7700] text-white p-5 flex flex-col gap-4 min-h-[220px]">
      <header className="flex items-start justify-between gap-3">
        <span className="text-4xl font-semibold tabular-nums">
          {promo.discount_percent}%
        </span>
        <span className="text-xs opacity-90 mt-2">
          {formatExpires(promo.expires_at)}
        </span>
      </header>

      <p className="text-sm flex-1">
        Скидка {promo.discount_percent}% на заказ
      </p>

      <button
        type="button"
        onClick={handleCopy}
        className="h-11 rounded-xl bg-white text-[#0C0310] text-sm font-semibold tracking-wide hover:bg-[#F0F0F0] transition"
      >
        {copied ? 'Скопировано' : promo.code}
      </button>
    </article>
  )
}
