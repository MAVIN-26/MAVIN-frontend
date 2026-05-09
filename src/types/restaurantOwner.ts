// Strictly matches swagger schema: RestaurantOwner + body for PUT /owner/restaurant.
import type { Category } from './category'

export interface RestaurantOwner {
  id: number
  name: string
  description: string
  photo_url: string
  pickup_address: string
  is_active: boolean
  average_rating: number
  review_count: number
  preparation_time_min: number | null
  preparation_time_max: number | null
  card_bg_color: string | null
  card_bg_image_url: string | null
  categories: Category[]
}

export interface RestaurantOwnerUpdateBody {
  name?: string
  description?: string
  photo_url?: string
  pickup_address?: string
  preparation_time_min?: number | null
  preparation_time_max?: number | null
  card_bg_color?: string | null
  card_bg_image_url?: string | null
}
