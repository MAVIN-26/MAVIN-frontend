import { useState } from 'react'
import { useSubscription } from '../hooks/useSubscription'
import ConfirmDialog from '../components/ConfirmDialog'
import { toast } from '../store/toastStore'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

export default function SubscriptionPage() {
  const { plans, my, loading, busy, error, buy, cancel } = useSubscription()
  const [confirmCancel, setConfirmCancel] = useState(false)

  // По дизайну — всегда тариф "Студент+". Берём первый план.
  const plan = plans[0]
  const isPurchased = my?.is_active === true && my?.is_cancelled === false
  const isCancelledActive = my?.is_active === true && my?.is_cancelled === true
  // Иначе — не оформлена

  const headerName = plan?.name ? `«${plan.name}»` : '«Студент+»'
  const features = plan?.features ?? []

  const handleBuy = async () => {
    if (!plan) return
    try {
      await buy(plan.id)
      toast.success(my ? 'Подписка продлена' : 'Подписка оформлена')
    } catch {
      toast.error('Не удалось оформить подписку')
    }
  }

  const handleCancel = async () => {
    try {
      await cancel()
      setConfirmCancel(false)
      toast.success('Подписка будет отменена в конце периода')
    } catch {
      toast.error('Не удалось отменить подписку')
    }
  }

  return (
    <section>
      <div className="relative rounded-[20px] border border-[#E5E5E5] bg-white px-8 py-7 mb-8">
        {/* Бейдж справа */}
        <div className="absolute right-6 top-5 text-sm text-[#9A9A9A]">
          {isPurchased
            ? 'Оформлена'
            : isCancelledActive
              ? 'Отменена'
              : 'Не оформлена'}
        </div>

        <h1 className="text-center text-xl font-semibold tracking-wide text-[#0C0310]">
          ПОДПИСКА {headerName.toUpperCase()}
        </h1>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 h-24 rounded-lg bg-[#F4F4F4] animate-pulse" />
        ) : (
          <>
            <p className="mt-4 text-sm text-[#3C3C3C]">
              {features.length > 0 ? (
                <>Что входит: {features.join(', ')}.</>
              ) : (
                <>Что входит: ИИ-ассистент, скидка 5% на все заказы, приоритетная готовка.</>
              )}
            </p>
            <p className="mt-1 text-sm text-[#9A9A9A]">
              Подписка автоматически продлевается каждые{' '}
              {plan?.duration_days ?? 30} дней. Можно отменить в любой момент.
            </p>

            {/* Состояние "не оформлена" */}
            {!my && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="text-sm text-[#0C0310]">
                  <span className="font-semibold">Цена:</span>{' '}
                  {plan ? `${plan.price} ₽/мес` : '199 ₽/мес'}
                </div>
                <button
                  type="button"
                  onClick={handleBuy}
                  disabled={busy || !plan}
                  className="w-full max-w-[640px] h-12 rounded-full bg-[#FF7700] text-white text-sm font-semibold uppercase tracking-wide hover:bg-[#E66A00] disabled:opacity-60 transition-colors"
                >
                  {busy
                    ? 'Оформляем…'
                    : plan
                      ? `Оформить за ${plan.price} ₽`
                      : 'Оформить подписку'}
                </button>
              </div>
            )}

            {/* Состояние "оформлена" */}
            {isPurchased && (
              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  disabled={busy}
                  className="h-11 px-6 rounded-full border border-[#E5E5E5] text-sm text-[#0C0310] hover:bg-[#F6F6F6] disabled:opacity-60 transition-colors"
                >
                  Отменить
                </button>
                <div className="text-sm font-semibold tracking-wide text-[#0C0310]">
                  ПОДПИСКА ОФОРМЛЕНА
                  {my?.expires_at && (
                    <span className="ml-3 text-[#9A9A9A] font-normal">
                      до {formatDate(my.expires_at)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleBuy}
                  disabled={busy || !plan}
                  className="h-11 px-6 rounded-full bg-[#FF7700] text-white text-sm font-semibold hover:bg-[#E66A00] disabled:opacity-60 transition-colors"
                >
                  {busy ? 'Продлеваем…' : 'Продлить'}
                </button>
              </div>
            )}

            {/* Состояние "отменена, но действует" */}
            {isCancelledActive && (
              <div className="mt-8 flex items-center justify-between gap-4">
                <div className="text-sm font-semibold tracking-wide text-[#0C0310]">
                  ПОДПИСКА ОТМЕНЕНА, ДЕЙСТВУЕТ ДО{' '}
                  {my?.expires_at ? formatDate(my.expires_at) : '—'}
                </div>
                <button
                  type="button"
                  onClick={handleBuy}
                  disabled={busy || !plan}
                  className="h-11 px-6 rounded-full bg-[#FF7700] text-white text-sm font-semibold hover:bg-[#E66A00] disabled:opacity-60 transition-colors"
                >
                  {busy ? 'Возобновляем…' : 'Возобновить'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Отменить подписку?"
        message="Подписка останется активной до конца оплаченного периода. После этого премиум-возможности будут отключены."
        confirmLabel="Отменить подписку"
        cancelLabel="Не отменять"
        tone="danger"
        busy={busy}
        onConfirm={handleCancel}
        onClose={() => setConfirmCancel(false)}
      />
    </section>
  )
}
