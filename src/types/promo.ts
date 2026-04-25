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

// POST /admin/promo body
export interface PromoCodeCreateBody {
  code: string
  discount_percent: number
  expires_at?: string | null
}

// PUT /admin/promo/{id} body — все поля опциональны
export interface PromoCodeUpdateBody {
  is_active?: boolean
  discount_percent?: number
  expires_at?: string | null
}
