import client from './client'
import type {
  PaginatedResponseRestaurantPublic,
  RestaurantPublic,
  RestaurantsQuery,
} from '../types/restaurant'

// GET /restaurants — public catalog
export async function getRestaurants(
  params: RestaurantsQuery = {},
): Promise<PaginatedResponseRestaurantPublic> {
  const res = await client.get<PaginatedResponseRestaurantPublic>('/restaurants', {
    params,
  })
  return res.data
}

// GET /restaurants/{id} — public card
export async function getRestaurant(id: number): Promise<RestaurantPublic> {
  const res = await client.get<RestaurantPublic>(`/restaurants/${id}`)
  return res.data
}
