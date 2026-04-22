import client from './client'
import type { AuthResponse, LoginPayload, RegisterPayload, UserProfile } from '../types/auth'

// Бэк возвращает OAuth2-стиль: { access_token, token_type, user }.
// Swagger описывает поле как `token` — расхождение, нормализуем на клиенте.
interface RawAuthResponse {
  access_token?: string
  token?: string
  token_type?: string
  user: UserProfile
}

const normalizeAuth = (raw: RawAuthResponse): AuthResponse => ({
  token: raw.access_token ?? raw.token ?? '',
  user: raw.user,
})

export const authApi = {
  login: (payload: LoginPayload) =>
    client
      .post<RawAuthResponse>('/auth/login', payload)
      .then((r: { data: RawAuthResponse }) => normalizeAuth(r.data)),

  register: (payload: RegisterPayload) =>
    client
      .post<RawAuthResponse>('/auth/register', payload)
      .then((r: { data: RawAuthResponse }) => normalizeAuth(r.data)),

  me: () =>
    client.get<UserProfile>('/auth/me').then((r: { data: UserProfile }) => r.data),

  logout: () =>
    client.post<{ message: string }>('/auth/logout').then((r: { data: { message: string } }) => r.data),
}
