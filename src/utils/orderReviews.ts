// API не возвращает rating в OrderListItem/OrderDetail, поэтому факт оставленного
// отзыва храним локально, чтобы после перезагрузки страницы звёзды оставались
// зафиксированными.
const KEY = 'mavin.orderReviews.v1'

type Store = Record<number, number>

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Store) : {}
  } catch {
    return {}
  }
}

function write(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // ignore quota errors
  }
}

export function getReview(orderId: number): number | null {
  const store = read()
  const v = store[orderId]
  return typeof v === 'number' ? v : null
}

export function saveReview(orderId: number, rating: number) {
  const store = read()
  store[orderId] = rating
  write(store)
}
