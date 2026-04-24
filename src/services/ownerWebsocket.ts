// WebSocket-канал для админа ресторана.
// План FE-3.6.3 описывает события `new_order` и смены статуса. В swagger
// owner-канал не описан явно (есть только клиентский /ws/orders), поэтому
// здесь принят формат по аналогии: WS /ws/owner/orders?token=JWT
// с событиями `new_order` и `order_status_changed`. Если бэк выберет иное
// — поправить ENDPOINT и парсер.

export interface OwnerNewOrderEvent {
  event: 'new_order'
  data: { order_id: number }
}

export interface OwnerOrderStatusChangedEvent {
  event: 'order_status_changed'
  data: {
    order_id: number
    new_status: string
    old_status?: string
  }
}

export type OwnerWSEvent = OwnerNewOrderEvent | OwnerOrderStatusChangedEvent

type Listener = (event: OwnerWSEvent) => void

const RECONNECT_DELAY_MS = 2000
const RECONNECT_MAX_DELAY_MS = 30_000

class OwnerOrderEventsClient {
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
    const url = `${proto}://${window.location.host}/api/v1/ws/owner/orders?token=${encodeURIComponent(this.token)}`

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
      if (!isOwnerEvent(parsed)) return
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

function isOwnerEvent(value: unknown): value is OwnerWSEvent {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  const d = v.data as Record<string, unknown> | undefined
  if (!d || typeof d.order_id !== 'number') return false
  if (v.event === 'new_order') return true
  if (v.event === 'order_status_changed') {
    return typeof d.new_status === 'string'
  }
  return false
}

export const ownerOrderEventsClient = new OwnerOrderEventsClient()

// Короткий beep через Web Audio API. Не требует медиа-файла.
export function playNewOrderBeep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.08
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.18)
    osc.onended = () => ctx.close().catch(() => {})
  } catch {
    // ignore — beep is non-critical
  }
}
