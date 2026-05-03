import { create, type StateCreator } from 'zustand'
import axios from 'axios'
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../api/cart'
import type { Cart } from '../types/cart'

interface PendingAdd {
  menu_item_id: number
  quantity: number
}

interface CartState {
  cart: Cart | null
  loading: boolean
  error: string | null
  // Set when POST /cart/items returns 409 (item belongs to another restaurant).
  // UI shows a confirmation modal; resolveConflict() clears cart and re-adds.
  conflict: PendingAdd | null
  // How many minutes from now the user wants to pick up the order. Default
  // 30 min; read by the checkout page when building pickup_time for POST /orders.
  pickupOffsetMinutes: number

  fetch: () => Promise<void>
  add: (menu_item_id: number, quantity?: number) => Promise<void>
  updateQuantity: (item_id: number, quantity: number) => Promise<void>
  remove: (item_id: number) => Promise<void>
  clear: () => Promise<void>
  resolveConflict: () => Promise<void>
  dismissConflict: () => void
  setPickupOffset: (minutes: number) => void
  reset: () => void
}

const empty = (): Cart => ({ restaurant_id: null, items: [], subtotal: 0 })

const toMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError(e)) return e.response?.data?.message ?? fallback
  if (e instanceof Error) return e.message
  return fallback
}

const storeCreator: StateCreator<CartState> = (set, get) => ({
  cart: null,
  loading: false,
  error: null,
  conflict: null,
  pickupOffsetMinutes: 30,

  fetch: async () => {
    set({ loading: true, error: null })
    try {
      const cart = await getCart()
      set({ cart, loading: false })
    } catch (e) {
      set({ loading: false, error: toMessage(e, 'Не удалось загрузить корзину') })
    }
  },

  add: async (menu_item_id, quantity = 1) => {
    set({ error: null })
    try {
      await addCartItem(menu_item_id, quantity)
      await get().fetch()
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        set({ conflict: { menu_item_id, quantity } })
        return
      }
      set({ error: toMessage(e, 'Не удалось добавить в корзину') })
    }
  },

  updateQuantity: async (item_id, quantity) => {
    set({ error: null })
    try {
      if (quantity <= 0) {
        await removeCartItem(item_id)
        await get().fetch()
        return
      }
      await updateCartItem(item_id, quantity)
      await get().fetch()
    } catch (e) {
      set({ error: toMessage(e, 'Не удалось изменить количество') })
    }
  },

  remove: async (item_id) => {
    set({ error: null })
    try {
      await removeCartItem(item_id)
      await get().fetch()
    } catch (e) {
      set({ error: toMessage(e, 'Не удалось удалить блюдо') })
    }
  },

  clear: async () => {
    set({ error: null })
    try {
      await clearCart()
      set({ cart: empty() })
    } catch (e) {
      set({ error: toMessage(e, 'Не удалось очистить корзину') })
    }
  },

  resolveConflict: async () => {
    const pending = get().conflict
    if (!pending) return
    set({ conflict: null, error: null })
    try {
      await clearCart()
      await addCartItem(pending.menu_item_id, pending.quantity)
      await get().fetch()
    } catch (e) {
      set({ error: toMessage(e, 'Не удалось обновить корзину') })
    }
  },

  dismissConflict: () => set({ conflict: null }),

  setPickupOffset: (minutes) => set({ pickupOffsetMinutes: minutes }),

  reset: () =>
    set({
      cart: null,
      loading: false,
      error: null,
      conflict: null,
      pickupOffsetMinutes: 30,
    }),
})

export const useCartStore = create<CartState>(storeCreator)
