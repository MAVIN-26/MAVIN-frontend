import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { useAiAssistant } from '../hooks/useAiAssistant'
import { getRestaurants } from '../api/restaurants'
import type { RestaurantPublic } from '../types/restaurant'
import type { MenuItemPublic } from '../types/menuItem'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import DishModal from './DishModal'

const TEMPLATES: { label: string; prompt: string }[] = [
  {
    label: 'Вопрос по заказу',
    prompt: 'У меня вопрос по моему заказу: ',
  },
  {
    label: 'Оплата и промокоды',
    prompt: 'Подскажите, как работает оплата и промокоды?',
  },
  {
    label: 'Сотрудничество',
    prompt: 'Как стать партнёром или сотрудничать с MAVIN?',
  },
]

export default function AiAssistantWidget() {
  const location = useLocation()
  const restaurantMatch = useMatch('/restaurants/:id')
  const routeRestaurantId = restaurantMatch?.params.id
    ? Number(restaurantMatch.params.id)
    : null

  const user = useAuthStore((s) => s.user)
  if (user && user.role !== 'customer') return null

  return (
    <AiAssistantWidgetInner
      key={location.pathname}
      routeRestaurantId={routeRestaurantId}
    />
  )
}

function AiAssistantWidgetInner({
  routeRestaurantId,
}: {
  routeRestaurantId: number | null
}) {
  const [open, setOpen] = useState(false)
  const [showSubTooltip, setShowSubTooltip] = useState(false)
  const [input, setInput] = useState('')
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(
    routeRestaurantId,
  )
  const [restaurants, setRestaurants] = useState<RestaurantPublic[]>([])
  const [loadingRestaurants, setLoadingRestaurants] = useState(false)
  const [showSubPrompt, setShowSubPrompt] = useState(false)
  const [previewDish, setPreviewDish] = useState<MenuItemPublic | null>(null)

  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { messages, sending, send } = useAiAssistant()
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!showSubTooltip) return
    function handleClick(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowSubTooltip(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showSubTooltip])

  // Sync with route changes: while the panel is open and the user navigates
  // to a restaurant page, auto-pick that restaurant.
  useEffect(() => {
    if (routeRestaurantId != null) {
      setSelectedRestaurantId(routeRestaurantId)
    }
  }, [routeRestaurantId])

  // Load restaurant list lazily — only when the user is on the home page and
  // opens the panel.
  useEffect(() => {
    if (!open) return
    if (routeRestaurantId != null) return
    if (restaurants.length > 0 || loadingRestaurants) return
    setLoadingRestaurants(true)
    getRestaurants({ limit: 50 })
      .then((res) => setRestaurants(res.items))
      .catch(() => setRestaurants([]))
      .finally(() => setLoadingRestaurants(false))
  }, [open, routeRestaurantId, restaurants.length, loadingRestaurants])

  // Autoscroll on new messages.
  useEffect(() => {
    if (!open) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const canPickRestaurant = routeRestaurantId == null
  const restaurantId = selectedRestaurantId

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    if (restaurantId == null) return
    setShowSubPrompt(false)
    const text = input
    setInput('')
    const result = await send(text, restaurantId)
    if (result.status === 'need_subscription') {
      setShowSubPrompt(true)
    }
  }

  const showTemplates = messages.length === 0

  const handleLauncherClick = () => {
    if (!user?.is_premium) {
      setShowSubTooltip((v) => !v)
    } else {
      setOpen(true)
    }
  }

  return (
    <>
      {/* Floating launcher + subscription tooltip */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
          {showSubTooltip && (
            <div
              ref={tooltipRef}
              className="w-[280px] bg-white rounded-2xl shadow-xl border border-[#EBEBEB] p-4 flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-12 h-12 rounded-full bg-[#FF7700] flex items-center justify-center">
                  <SunflowerIcon />
                </div>
                <p className="text-sm text-[#0C0310] leading-snug">
                  Нейро-нутрициолог доступен только по подписке. А ещё она даёт скидку 5% на всё меню!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSubTooltip(false)
                  navigate('/subscription')
                }}
                className="w-full py-2.5 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56A00]"
              >
                Оформить за 199 р/мес
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleLauncherClick}
            aria-label="Открыть ИИ-ассистента"
            className="w-14 h-14 rounded-full bg-[#FF7700] text-white shadow-lg hover:bg-[#E56A00] flex items-center justify-center"
          >
            <SunflowerIcon />
          </button>
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-30 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-xl border border-[#EBEBEB] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
            <div className="text-sm font-semibold text-[#0C0310]">
              ИИ-ассистент
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="w-7 h-7 rounded-full text-[#3C3C3C] hover:bg-[#F0F0F0] flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Restaurant context (only on home) */}
          {canPickRestaurant && (
            <div className="px-4 pt-3">
              <label className="block text-xs text-[#8C8C8C] mb-1">
                Выберите ресторан
              </label>
              <select
                value={selectedRestaurantId ?? ''}
                onChange={(e) =>
                  setSelectedRestaurantId(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                disabled={loadingRestaurants}
                className="w-full h-9 px-3 text-sm rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] text-[#0C0310] focus:outline-none focus:border-[#FF7700]"
              >
                <option value="">
                  {loadingRestaurants ? 'Загрузка…' : 'Не выбрано'}
                </option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {showTemplates && (
              <div className="flex flex-col gap-2">
                <div className="text-xs text-[#8C8C8C]">
                  Спросите нутрициолога или выберите шаблон:
                </div>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setInput(t.prompt)}
                      className="px-3 py-1.5 text-xs rounded-full bg-[#FAFAFA] border border-[#EBEBEB] text-[#0C0310] hover:bg-[#F0F0F0]"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onDishClick={setPreviewDish}
              />
            ))}

            {sending && (
              <div className="self-start text-xs text-[#8C8C8C]">
                Ассистент печатает…
              </div>
            )}

            {showSubPrompt && (
              <div className="self-start max-w-[85%] rounded-2xl rounded-bl-sm px-3 py-2 bg-[#FFBA7D] border border-[#FFBA7D] text-xs text-[#0C0310]">
                <div className="font-medium mb-1">
                  Нужна подписка «Студент+»
                </div>
                <div className="text-[#3C3C3C] mb-2">
                  ИИ-ассистент доступен только по подписке. Оформите за 199 ₽/мес.
                </div>
                <Link
                  to="/subscription"
                  onClick={() => setOpen(false)}
                  className="inline-block px-3 py-1.5 rounded-full bg-[#FF7700] text-white text-xs hover:bg-[#E56A00]"
                >
                  Оформить подписку
                </Link>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-[#F0F0F0] px-3 py-2 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Текст…"
              disabled={sending}
              className="flex-1 h-9 px-3 text-sm rounded-full bg-[#FAFAFA] border border-[#EBEBEB] text-[#0C0310] focus:outline-none focus:border-[#FF7700] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={
                sending || !input.trim() || restaurantId == null
              }
              aria-label="Отправить"
              className="w-9 h-9 rounded-full bg-[#FF7700] text-white flex items-center justify-center hover:bg-[#E56A00] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      <DishModal item={previewDish} onClose={() => setPreviewDish(null)} />
    </>
  )
}

function MessageBubble({
  message,
  onDishClick,
}: {
  message: ReturnType<typeof useAiAssistant>['messages'][number]
  onDishClick: (item: MenuItemPublic) => void
}) {
  if (message.role === 'user') {
    return (
      <div className="self-end max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 bg-[#FF7700] text-white text-sm whitespace-pre-wrap">
        {message.text}
      </div>
    )
  }
  if (message.role === 'error') {
    return (
      <div className="self-start max-w-[85%] rounded-2xl rounded-bl-sm px-3 py-2 bg-red-50 text-red-700 text-sm">
        {message.text}
      </div>
    )
  }
  return (
    <div className="self-start max-w-full flex flex-col gap-2">
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-3 py-2 bg-[#FAFAFA] text-[#0C0310] text-sm whitespace-pre-wrap">
        {message.text}
      </div>
      {message.dishes.length > 0 && (
        <div>
          <div className="text-xs text-[#8C8C8C] mb-1">Рекомендую это:</div>
          <RecommendedCarousel
            items={message.dishes}
            onClick={onDishClick}
          />
        </div>
      )}
    </div>
  )
}

function RecommendedCarousel({
  items,
  onClick,
}: {
  items: MenuItemPublic[]
  onClick: (item: MenuItemPublic) => void
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const add = useCartStore((s) => s.add)

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {items.map((item) => (
        <div
          key={item.id}
          className="shrink-0 w-[140px] rounded-xl border border-[#EBEBEB] bg-white overflow-hidden flex flex-col"
        >
          <button
            type="button"
            onClick={() => onClick(item)}
            className="block w-full aspect-square bg-[#D9D9D9]"
          >
            {item.photo_url && (
              <img
                src={item.photo_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            )}
          </button>
          <div className="p-2 flex flex-col gap-1">
            <div className="text-xs text-[#0C0310] line-clamp-2 min-h-[2rem]">
              {item.name}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-[#0C0310]">
                {Math.round(item.price)} ₽
              </div>
              <button
                type="button"
                disabled={!isAuthenticated}
                onClick={() => add(item.id, 1)}
                title={
                  !isAuthenticated ? 'Войдите, чтобы добавить' : undefined
                }
                className="px-2 py-1 rounded-full bg-[#FF7700] text-white text-[10px] hover:bg-[#E56A00] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                В корзину
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SunflowerIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 32 32"
      fill="none"
      stroke="#0C0310"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* connections */}
      <line x1="9" y1="7" x2="22" y2="9" />
      <line x1="9" y1="7" x2="6" y2="18" />
      <line x1="9" y1="7" x2="16" y2="17" />
      <line x1="22" y1="9" x2="26" y2="18" />
      <line x1="22" y1="9" x2="16" y2="17" />
      <line x1="6" y1="18" x2="16" y2="17" />
      <line x1="6" y1="18" x2="13" y2="26" />
      <line x1="26" y1="18" x2="16" y2="17" />
      <line x1="26" y1="18" x2="22" y2="26" />
      <line x1="16" y1="17" x2="13" y2="26" />
      <line x1="16" y1="17" x2="22" y2="26" />
      <line x1="13" y1="26" x2="22" y2="26" />
      {/* nodes */}
      <circle cx="9" cy="7" r="2.4" fill="#FF7700" />
      <circle cx="22" cy="9" r="2.4" fill="#FF7700" />
      <circle cx="6" cy="18" r="2.4" fill="#FF7700" />
      <circle cx="26" cy="18" r="2.4" fill="#FF7700" />
      <circle cx="16" cy="17" r="2.4" fill="#FF7700" />
      <circle cx="13" cy="26" r="2.4" fill="#FF7700" />
      <circle cx="22" cy="26" r="2.4" fill="#FF7700" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 12l18-8-8 18-2.5-7.5L3 12z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
