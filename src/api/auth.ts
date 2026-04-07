import client from './client'
import type { AuthResponse, LoginPayload, RegisterPayload, UserProfile } from '../types/auth'

export const authApi = {
  login: (payload: LoginPayload) =>
    client.post<AuthResponse>('/auth/login', payload).then((r: { data: AuthResponse }) => r.data),

  register: (payload: RegisterPayload) =>
    client.post<AuthResponse>('/auth/register', payload).then((r: { data: AuthResponse }) => r.data),

  me: () =>
    client.get<UserProfile>('/auth/me').then((r: { data: UserProfile }) => r.data),

  logout: () =>
    client.post<{ message: string }>('/auth/logout').then((r: { data: { message: string } }) => r.data),
}
