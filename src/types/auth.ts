export interface UserProfile {
  id: number
  email: string
  phone: string
  first_name: string
  last_name: string
  role: 'customer' | 'restaurant_admin' | 'site_admin'
  is_premium: boolean
  is_blocked: boolean
  created_at: string
  allergens: { id: number; name: string }[]
}

export interface AuthResponse {
  token: string
  user: UserProfile
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
}
