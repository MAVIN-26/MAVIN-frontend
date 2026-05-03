import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../hooks/useCategories'
import FeedbackModal from '../components/FeedbackModal'
import type { Category } from '../types/category'

const companyLinks: { label: string; to: string }[] = [
  { label: 'Пользовательские соглашения', to: '/legal/terms' },
  { label: 'Контакты', to: '/contacts' },
  { label: 'Вопросы и ответы', to: '/faq' },
  { label: 'Стать партнёром', to: '/partners' },
  { label: 'О подписке и ИИ', to: '/about-subscription' },
]

const COLUMN_COUNT = 4

function splitIntoColumns(items: Category[]): Category[][] {
  if (items.length === 0) return []
  const perCol = Math.ceil(items.length / COLUMN_COUNT)
  return Array.from({ length: COLUMN_COUNT }, (_, i) =>
    items.slice(i * perCol, (i + 1) * perCol),
  ).filter((c) => c.length > 0)
}

export default function Footer() {
  const { items, loading } = useCategories()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const columns = useMemo(() => splitIntoColumns(items), [items])

  return (
    <footer className="mt-auto">
      <div className="bg-[#ECF7FB]">
        <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 md:justify-between">
            {/* Подборки */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-black mb-4 md:mb-6">Подборки</h4>
              {loading && items.length === 0 ? (
                <p className="text-sm text-[#8C8C8C]">Загрузка категорий…</p>
              ) : items.length === 0 ? (
                <p className="text-sm text-[#8C8C8C]">Нет доступных категорий</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:gap-10 gap-x-4 gap-y-2">
                  {columns.map((col, i) => (
                    <ul key={i} className="space-y-2 md:min-w-[120px]">
                      {col.map((c) => (
                        <li key={c.id}>
                          <Link
                            to={`/?category_id=${c.id}`}
                            className="text-sm text-black hover:text-[#FF7700] transition-colors"
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              )}
            </div>

            {/* О компании */}
            <div className="md:text-right">
              <h4 className="text-sm font-bold text-black mb-4 md:mb-6">О компании</h4>
              <ul className="space-y-2">
                {companyLinks.map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-black hover:text-[#FF7700] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="mt-6 md:mt-10 inline-flex items-center gap-2 text-sm text-black hover:text-[#FF7700] transition-colors"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-black">
                  <svg width="14" height="10" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" stroke="currentColor"/>
                    <path d="M1 1L10 8L19 1" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                </span>
                Обратная связь
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-[#E4E4E4]">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <p className="text-xs text-[#777777]">© 2026 ООО «MAVIN»</p>
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </footer>
  )
}
