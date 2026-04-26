import client from './client'
import type {
  CreateOrderPayload,
  OrderDetail,
  OrdersQuery,
  PaginatedResponseOrderListItem,
  Review,
} from '../types/order'

// POST /orders — оформить заказ (самовывоз). 201 → OrderDetail.
// 404 — промокод не найден/истёк. 409 — блюдо из корзины недоступно.
export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderDetail> {
  const { data } = await client.post<OrderDetail>('/orders', payload)
  return data
}

// GET /orders — моя история заказов (paginated).
export async function getOrders(
  params: OrdersQuery = {},
): Promise<PaginatedResponseOrderListItem> {
  const { data } = await client.get<PaginatedResponseOrderListItem>('/orders', {
    params,
  })
  return data
}

// GET /orders/{id} — детали моего заказа.
export async function getOrder(id: number): Promise<OrderDetail> {
  const { data } = await client.get<OrderDetail>(`/orders/${id}`)
  return data
}

// POST /orders/{id}/cancel — 200 OK. 422 — нельзя (уже готовится).
export async function cancelOrder(id: number): Promise<void> {
  await client.post(`/orders/${id}/cancel`)
}

// POST /orders/{id}/review — оценить заказ (1–5). 422 — не completed.
export async function reviewOrder(
  id: number,
  rating: number,
): Promise<Review> {
  const { data } = await client.post<Review>(`/orders/${id}/review`, {
    rating,
  })
  return data
}
