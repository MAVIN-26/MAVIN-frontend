import { useEffect, useState } from 'react'
import { getRestaurant } from '../api/restaurants'
import type { RestaurantPublic } from '../types/restaurant'

interface State {
  data: RestaurantPublic | null
  loading: boolean
  error: string | null
}

export function useRestaurant(id: number | null) {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (id == null || Number.isNaN(id)) return
    let cancelled = false
    setState({ data: null, loading: true, error: null })
    getRestaurant(id)
      .then((data) => {
        if (cancelled) return
        setState({ data, loading: false, error: null })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const message =
          e instanceof Error ? e.message : 'Не удалось загрузить ресторан'
        setState({ data: null, loading: false, error: message })
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return state
}
