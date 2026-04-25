import { useCallback, useState } from 'react'
import { askAi } from '../api/ai'
import { getMenu } from '../api/menu'
import type { MenuItemPublic } from '../types/menuItem'

export type AiChatMessage =
  | { id: number; role: 'user'; text: string }
  | {
      id: number
      role: 'assistant'
      text: string
      dishes: MenuItemPublic[]
    }
  | { id: number; role: 'error'; text: string }

export type AiSendStatus = 'ok' | 'need_subscription' | 'unavailable' | 'error'

interface SendResult {
  status: AiSendStatus
}

let nextId = 1

export function useAiAssistant() {
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [sending, setSending] = useState(false)

  const reset = useCallback(() => {
    setMessages([])
  }, [])

  const send = useCallback(
    async (prompt: string, restaurantId: number): Promise<SendResult> => {
      const trimmed = prompt.trim()
      if (!trimmed || sending) return { status: 'error' }

      setMessages((m) => [
        ...m,
        { id: nextId++, role: 'user', text: trimmed },
      ])
      setSending(true)

      try {
        const rec = await askAi({ prompt: trimmed, restaurant_id: restaurantId })

        let dishes: MenuItemPublic[] = []
        if (rec.recommended_dish_ids.length > 0) {
          try {
            const menu = await getMenu(restaurantId)
            // Preserve the order returned by the AI.
            const byId = new Map(menu.map((m) => [m.id, m]))
            dishes = rec.recommended_dish_ids
              .map((id) => byId.get(id))
              .filter((x): x is MenuItemPublic => x !== undefined)
          } catch {
            // Failure to enrich dishes shouldn't drop the AI text.
            dishes = []
          }
        }

        setMessages((m) => [
          ...m,
          {
            id: nextId++,
            role: 'assistant',
            text: rec.ai_text,
            dishes,
          },
        ])
        return { status: 'ok' }
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status
        if (status === 403) {
          // Surface as a non-message signal — the widget shows a subscription
          // prompt instead of pushing an error bubble.
          return { status: 'need_subscription' }
        }
        if (status === 503) {
          setMessages((m) => [
            ...m,
            {
              id: nextId++,
              role: 'error',
              text: 'ИИ-сервис временно недоступен. Попробуйте позже.',
            },
          ])
          return { status: 'unavailable' }
        }
        setMessages((m) => [
          ...m,
          {
            id: nextId++,
            role: 'error',
            text: 'Не удалось получить ответ. Попробуйте ещё раз.',
          },
        ])
        return { status: 'error' }
      } finally {
        setSending(false)
      }
    },
    [sending],
  )

  return { messages, sending, send, reset }
}
