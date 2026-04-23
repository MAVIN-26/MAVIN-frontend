import { useCallback, useState } from 'react'
import axios from 'axios'
import { addCartItem, clearCart } from '../api/cart'

type Status =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'ok' }
  | { kind: 'conflict'; pendingItemId: number }
  | { kind: 'error'; message: string }

/**
 * Encapsulates "add N of item to cart" with 409 handling. When the server
 * returns 409 ("Блюдо из другого ресторана"), the caller can show a
 * confirmation UI and call `clearAndRetry()` to discard the current cart
 * and re-add the same item.
 */
export function useAddToCart() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const add = useCallback(async (menuItemId: number, quantity = 1) => {
    setStatus({ kind: 'pending' })
    try {
      await addCartItem(menuItemId, quantity)
      setStatus({ kind: 'ok' })
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        setStatus({ kind: 'conflict', pendingItemId: menuItemId })
        return
      }
      const message =
        e instanceof Error ? e.message : 'Не удалось добавить в корзину'
      setStatus({ kind: 'error', message })
    }
  }, [])

  const clearAndRetry = useCallback(async () => {
    if (status.kind !== 'conflict') return
    const itemId = status.pendingItemId
    setStatus({ kind: 'pending' })
    try {
      await clearCart()
      await addCartItem(itemId, 1)
      setStatus({ kind: 'ok' })
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Не удалось обновить корзину'
      setStatus({ kind: 'error', message })
    }
  }, [status])

  const reset = useCallback(() => setStatus({ kind: 'idle' }), [])

  return { status, add, clearAndRetry, reset }
}
