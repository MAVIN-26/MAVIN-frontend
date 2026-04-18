import client from './client'
import type { Category } from '../types/category'

// GET /categories — public reference
export async function getCategories(): Promise<Category[]> {
  const res = await client.get<Category[]>('/categories')
  return res.data
}
