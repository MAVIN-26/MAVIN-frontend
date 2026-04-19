import client from './client'
import type { MenuCategory } from '../types/menuCategory'

// GET /owner/menu-categories
export function listOwnerMenuCategories() {
  return client
    .get<MenuCategory[]>('/owner/menu-categories')
    .then((r) => r.data)
}

// POST /owner/menu-categories
export function createOwnerMenuCategory(name: string, sort_order = 0) {
  return client
    .post<MenuCategory>('/owner/menu-categories', { name, sort_order })
    .then((r) => r.data)
}

// PUT /owner/menu-categories/{id}
export function updateOwnerMenuCategory(
  id: number,
  body: { name?: string; sort_order?: number },
) {
  return client
    .put<MenuCategory>(`/owner/menu-categories/${id}`, body)
    .then((r) => r.data)
}

// DELETE /owner/menu-categories/{id}
export function deleteOwnerMenuCategory(id: number) {
  return client
    .delete<void>(`/owner/menu-categories/${id}`)
    .then(() => undefined)
}
