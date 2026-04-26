import client from './client'
import type {
  OrderStatus,
  OwnerOrderDetail,
  PaginatedResponseOwnerOrderListItem,
} from '../types/order'

interface OwnerOrdersQuery {
  status?: OrderStatus
  page?: number
  limit?: number
}

// GET /owner/orders — активные заказы кухни (paginated).
// Бэк сортирует premium-клиентов первыми.
export async function getOwnerOrders(
  params: OwnerOrdersQuery = {},
): Promise<PaginatedResponseOwnerOrderListItem> {
  const { data } = await client.get<PaginatedResponseOwnerOrderListItem>(
    '/owner/orders',
    { params },
  )
  return data
}

// GET /owner/orders/{id} — детали заказа.
export async function getOwnerOrder(id: number): Promise<OwnerOrderDetail> {
  const { data } = await client.get<OwnerOrderDetail>(`/owner/orders/${id}`)
  return data
}

// POST /owner/orders/{id}/accept → cooking
export async function acceptOwnerOrder(id: number): Promise<OwnerOrderDetail> {
  const { data } = await client.post<OwnerOrderDetail>(
    `/owner/orders/${id}/accept`,
  )
  return data
}

// POST /owner/orders/{id}/ready → ready_for_pickup
export async function markOwnerOrderReady(
  id: number,
): Promise<OwnerOrderDetail> {
  const { data } = await client.post<OwnerOrderDetail>(
    `/owner/orders/${id}/ready`,
  )
  return data
}

// POST /owner/orders/{id}/complete → completed
export async function completeOwnerOrder(
  id: number,
): Promise<OwnerOrderDetail> {
  const { data } = await client.post<OwnerOrderDetail>(
    `/owner/orders/${id}/complete`,
  )
  return data
}
