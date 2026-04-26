import client from './client'
import type { MenuItemPublic, MenuQuery } from '../types/menuItem'

// GET /restaurants/{id}/menu — public menu with filters
export async function getMenu(
  restaurantId: number,
  params: MenuQuery = {},
): Promise<MenuItemPublic[]> {
  const res = await client.get<MenuItemPublic[]>(
    `/restaurants/${restaurantId}/menu`,
    { params },
  )
  return res.data
}

// GET /restaurants/{id}/menu/user-choice — top dishes (last 30 days)
export async function getMenuUserChoice(
  restaurantId: number,
): Promise<MenuItemPublic[]> {
  const res = await client.get<MenuItemPublic[]>(
    `/restaurants/${restaurantId}/menu/user-choice`,
  )
  return res.data
}
