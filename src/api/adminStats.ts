import client from './client'
import type { AdminStats } from '../types/adminStats'

export function getAdminStats() {
  return client
    .get<AdminStats>('/admin/stats')
    .then((r: { data: AdminStats }) => r.data)
}
