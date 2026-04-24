// Strictly matches swagger schema PromoCode.
export interface PromoCode {
  id: number
  code: string
  discount_percent: number
  is_active: boolean
  expires_at: string
}

export interface PaginatedResponsePromoCode {
  items: PromoCode[]
  total: number
  page: number
  limit: number
  pages: number
}
