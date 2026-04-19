// Strictly matches swagger: MenuItemOwner (= MenuItemPublic + is_available),
// MenuItemCreate body (also used for PUT), MenuItemAvailability body.
import type { MenuItemPublic } from './menuItem'

export interface MenuItemOwner extends MenuItemPublic {
  is_available: boolean
}

export interface MenuItemCreateBody {
  name: string
  price: number
  menu_category_id: number
  description?: string
  photo_url?: string
  calories?: number
  proteins?: number
  fats?: number
  carbs?: number
  weight_grams?: number | null
  allergen_ids?: number[]
}
