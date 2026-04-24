import client from './client'
import type { PromoCode } from '../types/promo'

// POST /promo/validate — проверить промокод. 404 — не найден или истёк.
export async function validatePromo(code: string): Promise<PromoCode> {
  const { data } = await client.post<PromoCode>('/promo/validate', { code })
  return data
}
