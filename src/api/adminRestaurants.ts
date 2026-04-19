import client from './client'
import type {
  PaginatedResponseRestaurantAdmin,
  RestaurantAdmin,
  RestaurantAdminCreateBody,
  RestaurantAdminUpdateBody,
} from '../types/restaurantAdmin'
import type { UserProfile } from '../types/auth'

interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export function listAdminRestaurants(params: { page?: number; limit?: number }) {
  return client
    .get<PaginatedResponseRestaurantAdmin>('/admin/restaurants', { params })
    .then((r: { data: PaginatedResponseRestaurantAdmin }) => r.data)
}

export function createAdminRestaurant(body: RestaurantAdminCreateBody) {
  return client
    .post<RestaurantAdmin>('/admin/restaurants', body)
    .then((r: { data: RestaurantAdmin }) => r.data)
}

export function updateAdminRestaurant(id: number, body: RestaurantAdminUpdateBody) {
  return client
    .put<RestaurantAdmin>(`/admin/restaurants/${id}`, body)
    .then((r: { data: RestaurantAdmin }) => r.data)
}

export function deleteAdminRestaurant(id: number) {
  return client.delete<void>(`/admin/restaurants/${id}`).then(() => undefined)
}

// Lightweight helper for the "administrator" dropdown in restaurant form.
// Full users page (FE-2.4.4) will add a richer API. Here we just need the
// list filtered by role with a high limit.
export function listRestaurantAdminUsers() {
  return client
    .get<Paginated<UserProfile>>('/admin/users', {
      params: { role: 'restaurant_admin', limit: 100 },
    })
    .then((r: { data: Paginated<UserProfile> }) => r.data.items)
}
