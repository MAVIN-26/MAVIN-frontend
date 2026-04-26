// Strictly matches swagger schemas: RestaurantPublic, PaginatedResponse_RestaurantPublic
import type { Category } from './category'

export interface RestaurantPublic {
  id: number
  name: string
  description: string
  photo_url: string
  pickup_address: string
  average_rating: number
  review_count: number
  preparation_time_min: number | null
  preparation_time_max: number | null
  categories: Category[]
}

export interface PaginatedResponseRestaurantPublic {
  items: RestaurantPublic[]
  total: number
  page: number
  limit: number
  pages: number
}

// Matches swagger `sort` enum on GET /restaurants
export type RestaurantSort =
  | 'rating_desc'
  | 'rating_asc'
  | 'name_asc'
  | 'name_desc'

export interface RestaurantsQuery {
  category_id?: number
  search?: string
  page?: number
  limit?: number
  sort?: RestaurantSort
}
