import { create, type StateCreator } from 'zustand'

export interface OrderNotification {
  id: number
  order_id: number
  message: string
  new_status: string
  created_at: number
  read: boolean
}

interface State {
  items: OrderNotification[]
  add: (n: Omit<OrderNotification, 'id' | 'created_at' | 'read'>) => void
  markAllRead: () => void
  reset: () => void
}

let nextId = 1
const MAX_ITEMS = 50

const creator: StateCreator<State> = (set) => ({
  items: [],
  add: (n) =>
    set((s) => ({
      items: [
        {
          id: nextId++,
          order_id: n.order_id,
          new_status: n.new_status,
          message: n.message,
          created_at: Date.now(),
          read: false,
        },
        ...s.items,
      ].slice(0, MAX_ITEMS),
    })),
  markAllRead: () =>
    set((s) => ({ items: s.items.map((it) => ({ ...it, read: true })) })),
  reset: () => set({ items: [] }),
})

export const useNotificationStore = create<State>(creator)
