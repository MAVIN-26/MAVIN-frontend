import client from './client'
import type {
  PaginatedResponseRestaurantAdmin,
  RestaurantAdmin,
  RestaurantAdminCreateBody,
  RestaurantAdminUpdateBody,
} from '../types/restaurantAdmin'

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
