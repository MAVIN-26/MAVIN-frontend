import client from './client'
import type {
  PaginatedResponsePromoCode,
  PromoCode,
  PromoCodeCreateBody,
  PromoCodeUpdateBody,
} from '../types/promo'

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

// GET /admin/promo — все промокоды (включая неактивные).
export async function listAdminPromoCodes(params: {
  page?: number
  limit?: number
} = {}): Promise<PaginatedResponsePromoCode> {
  const { data } = await client.get<PaginatedResponsePromoCode>('/admin/promo', {
    params,
  })
  return data
}

// POST /admin/promo — создать промокод.
export async function createAdminPromoCode(
  body: PromoCodeCreateBody,
): Promise<PromoCode> {
  const { data } = await client.post<PromoCode>('/admin/promo', body)
  return data
}

// PUT /admin/promo/{id} — изменить промокод.
export async function updateAdminPromoCode(
  id: number,
  body: PromoCodeUpdateBody,
): Promise<PromoCode> {
  const { data } = await client.put<PromoCode>(`/admin/promo/${id}`, body)
  return data
}

// DELETE /admin/promo/{id} — удалить промокод.
export async function deleteAdminPromoCode(id: number): Promise<void> {
  await client.delete<void>(`/admin/promo/${id}`)
}
