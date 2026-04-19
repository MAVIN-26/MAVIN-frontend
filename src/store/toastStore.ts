import { create, type StateCreator } from 'zustand'

export type ToastKind = 'success' | 'error'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface ToastState {
  toasts: Toast[]
  show: (kind: ToastKind, message: string) => void
  dismiss: (id: number) => void
}

let nextId = 1

const creator: StateCreator<ToastState> = (set, get) => ({
  toasts: [],
  show: (kind, message) => {
    const id = nextId++
    set({ toasts: [...get().toasts, { id, kind, message }] })
    // Auto-dismiss after 4s
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) })
    }, 4000)
  },
  dismiss: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },
})

export const useToastStore = create<ToastState>(creator)

// Convenience wrapper for non-component call sites.
export const toast = {
  success: (message: string) =>
    useToastStore.getState().show('success', message),
  error: (message: string) => useToastStore.getState().show('error', message),
}
