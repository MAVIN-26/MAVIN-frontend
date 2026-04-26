// WebSocket-клиент для уведомлений о статусе заказа.
// Соответствует swagger schema WebSocketEvent: WS /ws/orders?token=JWT.
// Сейчас единственный event — order_status_changed.

import type { OrderStatus } from '../types/order'

export interface OrderStatusChangedEvent {
  event: 'order_status_changed'
  data: {
    order_id: number
    new_status: OrderStatus
    message: string
  }
}

export type WSEvent = OrderStatusChangedEvent

type Listener = (event: WSEvent) => void

const RECONNECT_DELAY_MS = 2000
const RECONNECT_MAX_DELAY_MS = 30_000

class OrderEventsClient {
  private socket: WebSocket | null = null
  private token: string | null = null
  private listeners = new Set<Listener>()
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private manuallyClosed = false

  connect(token: string) {
    if (this.socket && this.token === token) return
    if (this.socket) this.disconnect()

    this.token = token
    this.manuallyClosed = false
    this.openSocket()
  }

  disconnect() {
    this.manuallyClosed = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.socket) {
      this.socket.onopen = null
      this.socket.onclose = null
      this.socket.onerror = null
      this.socket.onmessage = null
      try {
        this.socket.close()
      } catch {
        // ignore
      }
      this.socket = null
    }
    this.token = null
    this.reconnectAttempt = 0
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private openSocket() {
    if (!this.token) return
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${proto}://${window.location.host}/api/v1/ws/orders?token=${encodeURIComponent(this.token)}`

    let socket: WebSocket
    try {
      socket = new WebSocket(url)
    } catch {
      this.scheduleReconnect()
      return
    }
    this.socket = socket

    socket.onopen = () => {
      this.reconnectAttempt = 0
    }

    socket.onmessage = (e) => {
      let parsed: unknown
      try {
        parsed = JSON.parse(typeof e.data === 'string' ? e.data : '')
      } catch {
        return
      }
      if (!isWSEvent(parsed)) return
      for (const l of this.listeners) {
        try {
          l(parsed)
        } catch {
          // listener errors must not break the socket
        }
      }
    }

    socket.onerror = () => {
      // onclose follows; reconnect logic lives there.
    }

    socket.onclose = () => {
      this.socket = null
      if (this.manuallyClosed) return
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.manuallyClosed || !this.token) return
    if (this.reconnectTimer) return
    const delay = Math.min(
      RECONNECT_DELAY_MS * 2 ** this.reconnectAttempt,
      RECONNECT_MAX_DELAY_MS,
    )
    this.reconnectAttempt += 1
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.openSocket()
    }, delay)
  }
}

function isWSEvent(value: unknown): value is WSEvent {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  if (v.event !== 'order_status_changed') return false
  const d = v.data as Record<string, unknown> | undefined
  return (
    !!d &&
    typeof d.order_id === 'number' &&
    typeof d.new_status === 'string' &&
    typeof d.message === 'string'
  )
}

export const orderEventsClient = new OrderEventsClient()
