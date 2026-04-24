import client from './client'
import type { PaginatedResponsePromoCode, PromoCode } from '../types/promo'

// POST /promo/validate — проверить промокод. 404 — не найден или истёк.
export async function validatePromo(code: string): Promise<PromoCode> {
  const { data } = await client.post<PromoCode>('/promo/validate', { code })
  return data
}

// GET /promo — доступные (активные и не истёкшие) промокоды.
export async function getPromoCodes(params: {
  page?: number
  limit?: number
} = {}): Promise<PaginatedResponsePromoCode> {
  const { data } = await client.get<PaginatedResponsePromoCode>('/promo', {
    params,
  })
  return data
}
