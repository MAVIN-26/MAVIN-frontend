// Strictly matches swagger schema: MenuItemPublic
import type { Allergen } from './allergen'

export interface MenuItemPublic {
  id: number
  name: string
  description: string
  photo_url: string
  price: number
  calories: number
  proteins: number
  fats: number
  carbs: number
  weight_grams: number | null
  menu_category_id: number | null
  allergens: Allergen[]
}

// Query params for GET /restaurants/{id}/menu
export interface MenuQuery {
  max_calories?: number
  max_price?: number
  // Comma-separated list of allergen IDs to exclude (per swagger example "1,3")
  exclude_allergen_ids?: string
}
