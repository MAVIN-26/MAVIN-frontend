import client from './client'
import type { MenuCategory } from '../types/menuCategory'

// GET /restaurants/{id}/menu-categories — public
export async function getMenuCategories(
  restaurantId: number,
): Promise<MenuCategory[]> {
  const res = await client.get<MenuCategory[]>(
    `/restaurants/${restaurantId}/menu-categories`,
  )
  return res.data
}
