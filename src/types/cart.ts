export interface CartItem {
  menu_item_id: number
  name: string
  price: number
  quantity: number
  subtotal: number
}

export interface Cart {
  restaurant_id: number | null
  items: CartItem[]
  subtotal: number
}
