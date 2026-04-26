import { useCallback, useEffect, useState } from 'react'
import { getOrder } from '../api/orders'
import type { OrderDetail } from '../types/order'

interface State {
  data: OrderDetail | null
  loading: boolean
  error: string | null
}

export function useOrder(id: number | null) {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
  })

  const load = useCallback((orderId: number) => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })
    getOrder(orderId)
      .then((data) => {
        if (cancelled) return
        setState({ data, loading: false, error: null })
      })
      .catch(() => {
        if (cancelled) return
        setState({
          data: null,
          loading: false,
          error: 'Не удалось загрузить заказ',
        })
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (id == null || Number.isNaN(id)) {
      setState({ data: null, loading: false, error: null })
      return
    }
    return load(id)
  }, [id, load])

  const refresh = useCallback(() => {
    if (id != null) load(id)
  }, [id, load])

  // Optimistic state setter for child interactions (cancel/review).
  const setData = useCallback((updater: (prev: OrderDetail) => OrderDetail) => {
    setState((s) => (s.data ? { ...s, data: updater(s.data) } : s))
  }, [])

  return { ...state, refresh, setData }
}
