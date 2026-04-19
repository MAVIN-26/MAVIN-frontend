import { useEffect, useState } from 'react'
import { getMenuCategories } from '../api/menuCategories'
import type { MenuCategory } from '../types/menuCategory'

interface State {
  items: MenuCategory[]
  loading: boolean
  error: string | null
}

const INITIAL: State = { items: [], loading: false, error: null }

export function useMenuCategories(restaurantId: number | null) {
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    if (restaurantId == null) return
    let cancelled = false
    setState({ items: [], loading: true, error: null })
    getMenuCategories(restaurantId)
      .then((items) => {
        if (cancelled) return
        setState({ items, loading: false, error: null })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const message =
          e instanceof Error ? e.message : 'Не удалось загрузить категории'
        setState({ items: [], loading: false, error: message })
      })
    return () => {
      cancelled = true
    }
  }, [restaurantId])

  return state
}
