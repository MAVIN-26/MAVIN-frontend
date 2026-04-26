import { useCallback, useEffect, useRef, useState } from 'react'
import { getRestaurants } from '../api/restaurants'
import type { RestaurantPublic, RestaurantsQuery } from '../types/restaurant'

interface State {
  items: RestaurantPublic[]
  total: number
  page: number
  pages: number
  limit: number
  loading: boolean
  error: string | null
}

const INITIAL: State = {
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  limit: 20,
  loading: false,
  error: null,
}

/**
 * Fetches /restaurants. Any change in category_id/search resets to page 1.
 * `loadMore()` appends the next page.
 */
export function useRestaurants(filters: Omit<RestaurantsQuery, 'page' | 'limit'>) {
  const [state, setState] = useState<State>(INITIAL)
  const reqIdRef = useRef(0)

  const load = useCallback(
    async (page: number, append: boolean) => {
      const reqId = ++reqIdRef.current
      setState((s) => ({ ...s, loading: true, error: null }))
      try {
        const data = await getRestaurants({ ...filters, page, limit: 20 })
        if (reqId !== reqIdRef.current) return // stale
        setState((s) => ({
          ...s,
          items: append ? [...s.items, ...data.items] : data.items,
          total: data.total,
          page: data.page,
          pages: data.pages,
          limit: data.limit,
          loading: false,
          error: null,
        }))
      } catch (e) {
        if (reqId !== reqIdRef.current) return
        const message = e instanceof Error ? e.message : 'Не удалось загрузить рестораны'
        setState((s) => ({ ...s, loading: false, error: message }))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.category_id, filters.search],
  )

  useEffect(() => {
    load(1, false)
  }, [load])

  const loadMore = useCallback(() => {
    setState((s) => {
      if (s.loading || s.page >= s.pages) return s
      void load(s.page + 1, true)
      return s
    })
  }, [load])

  return { ...state, loadMore }
}
