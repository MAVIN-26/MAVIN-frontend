import { useEffect, useState } from 'react'
import { getCategories } from '../api/categories'
import type { Category } from '../types/category'

interface State {
  items: Category[]
  loading: boolean
  error: string | null
}

export function useCategories() {
  const [state, setState] = useState<State>({ items: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    getCategories()
      .then((items) => {
        if (!cancelled) setState({ items, loading: false, error: null })
      })
      .catch((e) => {
        if (cancelled) return
        const message = e instanceof Error ? e.message : 'Не удалось загрузить категории'
        setState({ items: [], loading: false, error: message })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
