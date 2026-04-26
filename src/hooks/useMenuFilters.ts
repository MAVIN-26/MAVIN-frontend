import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { MenuQuery } from '../types/menuItem'

const NUMERIC_KEYS = [
  'max_calories',
  'max_price',
  'max_proteins',
  'max_fats',
  'max_carbs',
] as const

type NumericKey = (typeof NUMERIC_KEYS)[number]

export interface KbjuValues {
  max_calories?: number
  max_price?: number
  max_proteins?: number
  max_fats?: number
  max_carbs?: number
}

/**
 * Reads/writes menu filters to URL search params. Caller passes the result
 * of `filters` directly to `useMenu` — values are stable via memo.
 */
export function useMenuFilters() {
  const [params, setParams] = useSearchParams()

  const filters: MenuQuery = useMemo(() => {
    const result: MenuQuery = {}
    for (const key of NUMERIC_KEYS) {
      const raw = params.get(key)
      if (raw != null && raw !== '') {
        const num = Number(raw)
        if (Number.isFinite(num)) result[key] = num
      }
    }
    const exclude = params.get('exclude_allergen_ids')
    if (exclude) result.exclude_allergen_ids = exclude
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()])

  const kbjuActive = NUMERIC_KEYS.some((k) => filters[k] != null)
  const allergensActive = !!filters.exclude_allergen_ids

  const excludeAllergenIds: number[] = useMemo(() => {
    if (!filters.exclude_allergen_ids) return []
    return filters.exclude_allergen_ids
      .split(',')
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n))
  }, [filters.exclude_allergen_ids])

  const setKbju = useCallback(
    (values: KbjuValues) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const key of NUMERIC_KEYS) {
            const v = values[key]
            if (v == null || !Number.isFinite(v)) {
              next.delete(key)
            } else {
              next.set(key, String(v))
            }
          }
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const setExcludeAllergenIds = useCallback(
    (ids: number[]) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (ids.length === 0) {
            next.delete('exclude_allergen_ids')
          } else {
            next.set('exclude_allergen_ids', ids.join(','))
          }
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return {
    filters,
    kbjuActive,
    allergensActive,
    excludeAllergenIds,
    setKbju,
    setExcludeAllergenIds,
  }
}

export type { NumericKey }
