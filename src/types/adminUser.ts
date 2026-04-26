// Strictly matches swagger: body for POST /admin/users, PaginatedResponse_UserProfile.
import type { UserProfile } from './auth'

export type AdminCreatableRole = 'restaurant_admin' | 'customer'

export interface AdminUserCreateBody {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  role: AdminCreatableRole
}

export interface PaginatedResponseUserProfile {
  items: UserProfile[]
  total: number
  page: number
  limit: number
  pages: number
}

// Query params for GET /admin/users
export interface AdminUsersQuery {
  search?: string
  role?: 'customer' | 'restaurant_admin' | 'site_admin'
  page?: number
  limit?: number
}
