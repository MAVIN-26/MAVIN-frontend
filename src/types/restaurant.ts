// Strictly matches swagger schemas: RestaurantPublic, PaginatedResponse_RestaurantPublic

export interface RestaurantPublic {
  id: number
  name: string
  description: string
  photo_url: string
  pickup_address: string
  average_rating: number
}

export interface PaginatedResponseRestaurantPublic {
  items: RestaurantPublic[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface RestaurantsQuery {
  category_id?: number
  search?: string
  page?: number
  limit?: number
}
