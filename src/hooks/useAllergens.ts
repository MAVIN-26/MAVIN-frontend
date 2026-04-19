import { useEffect, useState } from 'react'
import { getAllergens } from '../api/allergens'
import type { Allergen } from '../types/allergen'

interface State {
  items: Allergen[]
  loading: boolean
  error: string | null
}

const INITIAL: State = { items: [], loading: false, error: null }

export function useAllergens() {
  const [state, setState] = useState<State>(INITIAL)

  useEffect(() => {
    let cancelled = false
    setState({ items: [], loading: true, error: null })
    getAllergens()
      .then((items) => {
        if (cancelled) return
        setState({ items, loading: false, error: null })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const message =
          e instanceof Error ? e.message : 'Не удалось загрузить аллергены'
        setState({ items: [], loading: false, error: message })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
