// Strictly matches swagger schemas for PUT /profile and PUT /profile/password
import type { UserProfile } from './auth'

export interface UserProfileUpdate {
  first_name: string
  last_name: string
  email: string
  allergen_ids: number[]
}

export interface PasswordChangePayload {
  old_password: string
  new_password: string
}

export type { UserProfile }
