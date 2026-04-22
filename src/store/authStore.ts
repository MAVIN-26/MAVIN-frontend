import { create, type StateCreator } from 'zustand'
import { authApi } from '../api/auth'
import type { UserProfile, LoginPayload, RegisterPayload } from '../types/auth'

interface AuthState {
  token: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<UserProfile>
  register: (payload: RegisterPayload) => Promise<UserProfile>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

const storeCreator: StateCreator<AuthState> = (set) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: false,

  login: async (payload) => {
    const data = await authApi.login(payload)
    localStorage.setItem('token', data.token)
    set({ token: data.token, user: data.user, isAuthenticated: true })
    return data.user
  },

  register: async (payload) => {
    const data = await authApi.register(payload)
    localStorage.setItem('token', data.token)
    set({ token: data.token, user: data.user, isAuthenticated: true })
    return data.user
  },

  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      localStorage.removeItem('token')
      set({ token: null, user: null, isAuthenticated: false })
    }
  },

  fetchMe: async () => {
    try {
      const user = await authApi.me()
      set({ user, isAuthenticated: true })
    } catch {
      localStorage.removeItem('token')
      set({ token: null, user: null, isAuthenticated: false })
    }
  },
})

export const useAuthStore = create<AuthState>(storeCreator)
