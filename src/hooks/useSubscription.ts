import { useCallback, useEffect, useState } from 'react'
import {
  buySubscription,
  cancelSubscription,
  getMySubscription,
  getPlans,
} from '../api/subscriptions'
import type { SubscriptionPlan, UserSubscription } from '../types/subscription'
import { useAuthStore } from '../store/authStore'

export function useSubscription() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const fetchMe = useAuthStore((s) => s.fetchMe)

  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [my, setMy] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [plansRes, myRes] = await Promise.all([
        getPlans(),
        isAuthenticated ? getMySubscription() : Promise.resolve(null),
      ])
      setPlans(plansRes)
      setMy(myRes)
    } catch {
      setError('Не удалось загрузить данные о подписке')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    load()
  }, [load])

  const buy = useCallback(
    async (planId: number) => {
      setBusy(true)
      setError(null)
      try {
        const next = await buySubscription(planId)
        setMy(next)
        // is_premium на пользователе мог измениться — обновим профиль
        await fetchMe()
      } catch {
        setError('Не удалось оформить подписку')
        throw new Error('buy failed')
      } finally {
        setBusy(false)
      }
    },
    [fetchMe],
  )

  const cancel = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const next = await cancelSubscription()
      setMy(next)
    } catch {
      setError('Не удалось отменить подписку')
      throw new Error('cancel failed')
    } finally {
      setBusy(false)
    }
  }, [])

  return { plans, my, loading, busy, error, buy, cancel, reload: load }
}
