// Strictly matches swagger schema: AIRecommendation
export interface AIRecommendation {
  ai_text: string
  recommended_dish_ids: number[]
}

// Request body for POST /ai/recommend
export interface AskAiPayload {
  prompt: string
  restaurant_id: number
}
