export interface CartItem {
  id: number
  menu_item_id: number
  name: string
  photo_url?: string | null
  price: number
  quantity: number
  subtotal: number
}

export interface Cart {
  restaurant_id: number | null
  items: CartItem[]
  subtotal: number
}
