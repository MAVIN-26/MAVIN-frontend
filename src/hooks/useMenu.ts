import { useEffect, useState } from 'react'
import { getMenu, getMenuUserChoice } from '../api/menu'
import type { MenuItemPublic, MenuQuery } from '../types/menuItem'

interface State {
  items: MenuItemPublic[]
  loading: boolean
  error: string | null
}

const INITIAL: State = { items: [], loading: false, error: null }

export function useUserChoice(
  restaurantId: number | null,
  filters: MenuQuery = {},
) {
  const [state, setState] = useState<State>(INITIAL)
  const {
    max_calories,
    max_price,
    max_proteins,
    max_fats,
    max_carbs,
    exclude_allergen_ids,
  } = filters

  useEffect(() => {
    if (restaurantId == null) return
    let cancelled = false
    setState({ items: [], loading: true, error: null })
    getMenuUserChoice(restaurantId, {
      max_calories,
      max_price,
      max_proteins,
      max_fats,
      max_carbs,
      exclude_allergen_ids,
    })
      .then((items) => {
        if (cancelled) return
        setState({ items, loading: false, error: null })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const message =
          e instanceof Error ? e.message : 'Не удалось загрузить блюда'
        setState({ items: [], loading: false, error: message })
      })
    return () => {
      cancelled = true
    }
  }, [
    restaurantId,
    max_calories,
    max_price,
    max_proteins,
    max_fats,
    max_carbs,
    exclude_allergen_ids,
  ])

  return state
}

export function useMenu(restaurantId: number | null, filters: MenuQuery = {}) {
  const [state, setState] = useState<State>(INITIAL)
  const {
    max_calories,
    max_price,
    max_proteins,
    max_fats,
    max_carbs,
    exclude_allergen_ids,
  } = filters

  useEffect(() => {
    if (restaurantId == null) return
    let cancelled = false
    setState({ items: [], loading: true, error: null })
    getMenu(restaurantId, {
      max_calories,
      max_price,
      max_proteins,
      max_fats,
      max_carbs,
      exclude_allergen_ids,
    })
      .then((items) => {
        if (cancelled) return
        setState({ items, loading: false, error: null })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const message =
          e instanceof Error ? e.message : 'Не удалось загрузить меню'
        setState({ items: [], loading: false, error: message })
      })
    return () => {
      cancelled = true
    }
  }, [
    restaurantId,
    max_calories,
    max_price,
    max_proteins,
    max_fats,
    max_carbs,
    exclude_allergen_ids,
  ])

  return state
}
