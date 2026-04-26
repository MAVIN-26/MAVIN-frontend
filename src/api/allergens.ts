import client from './client'
import type { Allergen } from '../types/allergen'

// GET /allergens — public reference
export async function getAllergens(): Promise<Allergen[]> {
  const res = await client.get<Allergen[]>('/allergens')
  return res.data
}
