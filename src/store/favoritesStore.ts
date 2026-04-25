import { create, type StateCreator } from 'zustand'
import axios from 'axios'
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from '../api/favorites'
import type { RestaurantPublic } from '../types/restaurant'

interface FavoritesState {
  // null = not loaded yet (vs [] = loaded, empty)
  items: RestaurantPublic[] | null
  loading: boolean
  error: string | null
  pendingIds: Set<number>

  fetch: () => Promise<void>
  add: (restaurant: RestaurantPublic) => Promise<void>
  remove: (id: number) => Promise<void>
  isFavorite: (id: number) => boolean
  reset: () => void
}

const toMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError(e)) return e.response?.data?.message ?? fallback
  if (e instanceof Error) return e.message
  return fallback
}

const creator: StateCreator<FavoritesState> = (set, get) => ({
  items: null,
  loading: false,
  error: null,
  pendingIds: new Set<number>(),

  fetch: async () => {
    set({ loading: true, error: null })
    try {
      const items = await getFavorites()
      set({ items, loading: false })
    } catch (e) {
      set({
        loading: false,
        error: toMessage(e, 'Не удалось загрузить избранное'),
      })
    }
  },

  add: async (restaurant) => {
    const { items, pendingIds } = get()
    if (pendingIds.has(restaurant.id)) return
    const already = items?.some((r) => r.id === restaurant.id)
    const nextItems = already ? items! : [...(items ?? []), restaurant]
    const nextPending = new Set(pendingIds).add(restaurant.id)
    set({ items: nextItems, pendingIds: nextPending })
    try {
      await addFavorite(restaurant.id)
    } catch (e) {
      // revert
      set({
        items: items ?? null,
        error: toMessage(e, 'Не удалось добавить в избранное'),
      })
    } finally {
      const p = new Set(get().pendingIds)
      p.delete(restaurant.id)
      set({ pendingIds: p })
    }
  },

  remove: async (id) => {
    const { items, pendingIds } = get()
    if (pendingIds.has(id)) return
    const nextItems = (items ?? []).filter((r) => r.id !== id)
    const nextPending = new Set(pendingIds).add(id)
    set({ items: nextItems, pendingIds: nextPending })
    try {
      await removeFavorite(id)
    } catch (e) {
      set({
        items: items ?? null,
        error: toMessage(e, 'Не удалось убрать из избранного'),
      })
    } finally {
      const p = new Set(get().pendingIds)
      p.delete(id)
      set({ pendingIds: p })
    }
  },

  isFavorite: (id) => !!get().items?.some((r) => r.id === id),

  reset: () =>
    set({
      items: null,
      loading: false,
      error: null,
      pendingIds: new Set<number>(),
    }),
})

export const useFavoritesStore = create<FavoritesState>(creator)
