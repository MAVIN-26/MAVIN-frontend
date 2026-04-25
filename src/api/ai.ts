import client from './client'
import type { AIRecommendation, AskAiPayload } from '../types/aiAssistant'

// POST /ai/recommend — premium-only; backend returns 403 without subscription
// and 503 if the LLM service is unavailable.
export async function askAi(payload: AskAiPayload): Promise<AIRecommendation> {
  const res = await client.post<AIRecommendation>('/ai/recommend', payload)
  return res.data
}
