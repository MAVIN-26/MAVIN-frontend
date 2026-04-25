// Strictly matches swagger: SubscriptionPlan, UserSubscription
export interface SubscriptionPlan {
  id: number
  name: string
  price: number
  duration_days: number
  features: string[]
}

export interface UserSubscription {
  plan: SubscriptionPlan
  expires_at: string
  is_active: boolean
  is_cancelled: boolean
}
