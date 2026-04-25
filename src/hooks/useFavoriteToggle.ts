import { useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { useFavoritesStore } from '../store/favoritesStore'
import { toast } from '../store/toastStore'
import type { RestaurantPublic } from '../types/restaurant'

/**
 * Returns favorite-state and a toggler for a single restaurant. Reads the
 * shared favorites store (loaded once at app start) — no per-card requests.
 * For unauthenticated users `toggle` shows a toast prompting to log in.
 */
export function useFavoriteToggle(restaurant: RestaurantPublic | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const id = restaurant?.id ?? null
  const isFavorite = useFavoritesStore((s) =>
    id == null ? false : s.isFavorite(id),
  )
  const pending = useFavoritesStore((s) =>
    id == null ? false : s.pendingIds.has(id),
  )
  const add = useFavoritesStore((s) => s.add)
  const remove = useFavoritesStore((s) => s.remove)

  const toggle = useCallback(async () => {
    if (!restaurant) return
    if (!isAuthenticated) {
      toast.error('Войдите, чтобы добавлять в избранное')
      return
    }
    if (isFavorite) {
      await remove(restaurant.id)
    } else {
      await add(restaurant)
    }
  }, [restaurant, isAuthenticated, isFavorite, add, remove])

  return { isFavorite, toggle, pending, isAuthenticated }
}
