// Strictly matches swagger schema AdminStats (GET /admin/stats).
export interface AdminStats {
  orders_today: number
  revenue_total: number
  active_subscriptions_count: number
}
