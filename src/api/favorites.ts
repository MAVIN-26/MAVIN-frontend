import client from './client'
import type { RestaurantPublic } from '../types/restaurant'

// GET /favorites — list favorites (auth required)
export async function getFavorites(): Promise<RestaurantPublic[]> {
  const res = await client.get<RestaurantPublic[]>('/favorites')
  return res.data
}

// POST /favorites/{rest_id}
export async function addFavorite(restId: number): Promise<void> {
  await client.post(`/favorites/${restId}`)
}

// DELETE /favorites/{rest_id}
export async function removeFavorite(restId: number): Promise<void> {
  await client.delete(`/favorites/${restId}`)
}
