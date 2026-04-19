import client from './client'
import type { UserProfile } from '../types/auth'
import type {
  UserProfileUpdate,
  PasswordChangePayload,
} from '../types/profile'

export function updateProfile(payload: UserProfileUpdate) {
  return client
    .put<UserProfile>('/profile', payload)
    .then((r: { data: UserProfile }) => r.data)
}

export function changePassword(payload: PasswordChangePayload) {
  return client
    .put<{ message: string }>('/profile/password', payload)
    .then((r: { data: { message: string } }) => r.data)
}
