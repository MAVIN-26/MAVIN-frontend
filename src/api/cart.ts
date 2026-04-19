import client from './client'

// POST /cart/items — add menu item to cart (auth required)
export async function addToCart(
  menu_item_id: number,
  quantity: number,
): Promise<void> {
  await client.post('/cart/items', { menu_item_id, quantity })
}

// DELETE /cart — clear cart
export async function clearCart(): Promise<void> {
  await client.delete('/cart')
}
