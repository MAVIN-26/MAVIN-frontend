import client from './client'
import type { Cart } from '../types/cart'

// GET /cart — current user's cart
export async function getCart(): Promise<Cart> {
  const { data } = await client.get<Cart>('/cart')
  return data
}

// POST /cart/items — add menu item to cart
export async function addCartItem(
  menu_item_id: number,
  quantity: number,
): Promise<Cart> {
  const { data } = await client.post<Cart>('/cart/items', {
    menu_item_id,
    quantity,
  })
  return data
}

// PUT /cart/items/{item_id} — change quantity (0 removes the item)
export async function updateCartItem(
  item_id: number,
  quantity: number,
): Promise<Cart> {
  const { data } = await client.put<Cart>(`/cart/items/${item_id}`, { quantity })
  return data
}

// DELETE /cart/items/{item_id} — remove a single item
export async function removeCartItem(item_id: number): Promise<void> {
  await client.delete(`/cart/items/${item_id}`)
}

// DELETE /cart — clear cart
export async function clearCart(): Promise<void> {
  await client.delete('/cart')
}
