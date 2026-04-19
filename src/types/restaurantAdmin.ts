// Strictly matches swagger schemas: RestaurantAdmin, RestaurantAdminShort,
// PaginatedResponse_RestaurantAdmin, and bodies for POST/PUT /admin/restaurants.
import type { Category } from './category'

export interface RestaurantAdminShort {
  id: number
  first_name: string
  last_name: string
  phone: string
  email: string
}

export interface RestaurantAdmin {
  id: number
  name: string
  description: string | null
  photo_url: string | null
  pickup_address: string
  average_rating: number
  review_count: number
  preparation_time_min: number | null
  preparation_time_max: number | null
  categories: Category[]
  is_active: boolean
  restaurant_admin_id: number | null
  restaurant_admin: RestaurantAdminShort | null
}

export interface PaginatedResponseRestaurantAdmin {
  items: RestaurantAdmin[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface RestaurantAdminCreateBody {
  name: string
  pickup_address: string
  restaurant_admin_id: number
  category_ids: number[]
  preparation_time_min?: number | null
  preparation_time_max?: number | null
}

export interface RestaurantAdminUpdateBody {
  name?: string
  description?: string
  photo_url?: string
  pickup_address?: string
  is_active?: boolean
  category_ids?: number[]
  restaurant_admin_id?: number
  preparation_time_min?: number | null
  preparation_time_max?: number | null
}
