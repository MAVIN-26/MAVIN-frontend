// Strictly matches swagger schemas: OrderListItem, OrderDetail.
// Денежные поля (Decimal) приходят с бэкенда строками — нормализуются в number в api/orders.ts.

export type OrderStatus =
  | 'created'
  | 'cooking'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled'

export type PaymentMethod = 'card_online' | 'cash_on_receipt'

export interface OrderListItem {
  id: number
  created_at: string
  total: number
  restaurant_id: number
  restaurant_name: string
  status: OrderStatus
}

export interface OrderItem {
  id: number
  menu_item_id: number | null
  name: string
  price: number
  quantity: number
  subtotal: number
}

export interface OrderDetail {
  id: number
  status: OrderStatus
  pickup_time: string
  comment?: string | null
  payment_method: PaymentMethod
  subtotal: number
  discount_percent: number
  total: number
  promo_code: string | null
  restaurant_id: number
  restaurant_name: string
  pickup_address: string
  created_at: string
  items: OrderItem[]
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
