import client from './client'
import type { Allergen } from '../types/allergen'
import type { Category } from '../types/category'

// --- Allergens (admin CRUD under /admin/allergens) ---
export function createAllergen(name: string) {
  return client
    .post<Allergen>('/admin/allergens', { name })
    .then((r: { data: Allergen }) => r.data)
}

export function updateAllergen(id: number, name: string) {
  return client
    .put<Allergen>(`/admin/allergens/${id}`, { name })
    .then((r: { data: Allergen }) => r.data)
}

export function deleteAllergen(id: number) {
  return client.delete<void>(`/admin/allergens/${id}`).then(() => undefined)
}

// --- Categories (admin CRUD lives on /categories per swagger) ---
export function createCategory(name: string) {
  return client
    .post<Category>('/categories', { name })
    .then((r: { data: Category }) => r.data)
}

export function updateCategory(id: number, name: string) {
  return client
    .put<Category>(`/categories/${id}`, { name })
    .then((r: { data: Category }) => r.data)
}

export function deleteCategory(id: number) {
  return client.delete<void>(`/categories/${id}`).then(() => undefined)
}
