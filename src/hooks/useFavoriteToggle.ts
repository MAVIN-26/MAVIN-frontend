import { useCallback, useEffect, useState } from 'react'
import { addFavorite, getFavorites, removeFavorite } from '../api/favorites'
import { useAuthStore } from '../store/authStore'

/**
 * Tracks whether a restaurant is in the authenticated user's favorites list
 * and provides a toggler. For unauthenticated users `isFavorite` stays false
 * and `toggle` is a no-op — caller is expected to hide the UI control.
 */
export function useFavoriteToggle(restaurantId: number | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [isFavorite, setIsFavorite] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || restaurantId == null) {
      setIsFavorite(false)
      return
    }
    let cancelled = false
    getFavorites()
      .then((items) => {
        if (cancelled) return
        setIsFavorite(items.some((r) => r.id === restaurantId))
      })
      .catch(() => {
        if (cancelled) return
        setIsFavorite(false)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, restaurantId])

  const toggle = useCallback(async () => {
    if (!isAuthenticated || restaurantId == null || pending) return
    setPending(true)
    const next = !isFavorite
    setIsFavorite(next) // optimistic
    try {
      if (next) {
        await addFavorite(restaurantId)
      } else {
        await removeFavorite(restaurantId)
      }
    } catch {
      setIsFavorite(!next) // revert
    } finally {
      setPending(false)
    }
  }, [isAuthenticated, restaurantId, isFavorite, pending])

  return { isFavorite, toggle, pending, canToggle: isAuthenticated }
}
