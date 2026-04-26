import client from './client'
import type { UserProfile } from '../types/auth'
import type {
  AdminUserCreateBody,
  AdminUsersQuery,
  PaginatedResponseUserProfile,
} from '../types/adminUser'

export function listAdminUsers(query: AdminUsersQuery) {
  return client
    .get<PaginatedResponseUserProfile>('/admin/users', { params: query })
    .then((r: { data: PaginatedResponseUserProfile }) => r.data)
}

export function createAdminUser(body: AdminUserCreateBody) {
  return client
    .post<UserProfile>('/admin/users', body)
    .then((r: { data: UserProfile }) => r.data)
}

export function blockAdminUser(id: number, isBlocked: boolean) {
  return client
    .patch<{ message: string }>(`/admin/users/${id}/block`, {
      is_blocked: isBlocked,
    })
    .then((r: { data: { message: string } }) => r.data)
}

// Thin helper used by the restaurant form to populate its admin dropdown.
export function listRestaurantAdminUsers() {
  return listAdminUsers({ role: 'restaurant_admin', limit: 100 }).then(
    (r) => r.items,
  )
}
