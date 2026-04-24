// Strictly matches swagger schemas: OrderListItem, OrderDetail.
import type { CartItem } from './cart'

export type OrderStatus =
  | 'created'
  | 'cooking'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled'

export type PaymentMethod = 'card_online' | 'cash_on_receipt'

export interface OrderListItem {
  id: number
  restaurant_name: string
  status: OrderStatus
  total: number
  pickup_time: string
  created_at: string
}

export interface OrderDetail extends OrderListItem {
  pickup_address: string
  items: CartItem[]
  comment?: string
  payment_method: PaymentMethod
  promo_code: string | null
  promo_discount_percent: number | null
  subscription_discount_percent: number | null
  total_discount: number
}

export interface CreateOrderPayload {
  pickup_time: string
  comment?: string
  payment_method: PaymentMethod
  promo_code?: string
}

export interface PaginatedResponseOrderListItem {
  items: OrderListItem[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface OrdersQuery {
  page?: number
  limit?: number
}

export interface Review {
  id: number
  rating: number
  created_at: string
}

// Strictly matches swagger OwnerOrderListItem / OwnerOrderDetail.
export interface OwnerOrderListItem {
  id: number
  status: OrderStatus
  customer_name: string
  pickup_time: string
  is_premium_client: boolean
}

export interface OwnerOrderDetail extends OwnerOrderListItem {
  customer_phone: string
  items: import('./cart').CartItem[]
  comment?: string
}

export interface PaginatedResponseOwnerOrderListItem {
  items: OwnerOrderListItem[]
  total: number
  page: number
  limit: number
  pages: number
}

export type OwnerActiveStatus = 'created' | 'cooking' | 'ready_for_pickup'
