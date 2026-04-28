import client from './client'
import type { SubscriptionPlan, UserSubscription } from '../types/subscription'

// GET /subscriptions/plans — public
export async function getPlans(): Promise<SubscriptionPlan[]> {
  const res = await client.get<SubscriptionPlan[]>('/subscriptions/plans')
  return res.data
}

// GET /subscriptions/my — auth
// Бек возвращает либо подписку, либо {is_active: false} когда активной нет.
// На всякий случай поддерживаем и 404 — нормализуем оба варианта к null.
export async function getMySubscription(): Promise<UserSubscription | null> {
  try {
    const res = await client.get<UserSubscription>('/subscriptions/my')
    if (res.data?.is_active !== true) return null
    return res.data
  } catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status
    if (status === 404) return null
    throw e
  }
}

// POST /subscriptions/buy
export async function buySubscription(planId: number): Promise<UserSubscription> {
  const res = await client.post<UserSubscription>('/subscriptions/buy', { plan_id: planId })
  return res.data
}

// POST /subscriptions/cancel
export async function cancelSubscription(): Promise<UserSubscription> {
  const res = await client.post<UserSubscription>('/subscriptions/cancel')
  return res.data
}
