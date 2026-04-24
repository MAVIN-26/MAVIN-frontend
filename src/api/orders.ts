import client from './client'
import type { CreateOrderPayload, OrderDetail } from '../types/order'

// POST /orders — оформить заказ (самовывоз). 201 → OrderDetail.
// 404 — промокод не найден/истёк. 409 — блюдо из корзины недоступно.
export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderDetail> {
  const { data } = await client.post<OrderDetail>('/orders', payload)
  return data
}
