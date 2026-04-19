import client from './client'
import type {
  RestaurantOwner,
  RestaurantOwnerUpdateBody,
} from '../types/restaurantOwner'

// GET /owner/restaurant
export function getOwnerRestaurant() {
  return client
    .get<RestaurantOwner>('/owner/restaurant')
    .then((r) => r.data)
}

// PUT /owner/restaurant
export function updateOwnerRestaurant(body: RestaurantOwnerUpdateBody) {
  return client
    .put<RestaurantOwner>('/owner/restaurant', body)
    .then((r) => r.data)
}
