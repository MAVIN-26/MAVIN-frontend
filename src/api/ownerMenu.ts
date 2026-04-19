import client from './client'
import type { MenuItemOwner, MenuItemCreateBody } from '../types/menuItemOwner'

// GET /owner/menu
export function listOwnerMenu() {
  return client
    .get<MenuItemOwner[]>('/owner/menu')
    .then((r) => r.data)
}

// POST /owner/menu
export function createOwnerMenuItem(body: MenuItemCreateBody) {
  return client
    .post<MenuItemOwner>('/owner/menu', body)
    .then((r) => r.data)
}

// PUT /owner/menu/{id}
export function updateOwnerMenuItem(id: number, body: MenuItemCreateBody) {
  return client
    .put<MenuItemOwner>(`/owner/menu/${id}`, body)
    .then((r) => r.data)
}

// DELETE /owner/menu/{id}
export function deleteOwnerMenuItem(id: number) {
  return client.delete<void>(`/owner/menu/${id}`).then(() => undefined)
}

// PATCH /owner/menu/{id}/availability
export function setOwnerMenuItemAvailability(id: number, is_available: boolean) {
  return client
    .patch<MenuItemOwner>(`/owner/menu/${id}/availability`, { is_available })
    .then((r) => r.data)
}
