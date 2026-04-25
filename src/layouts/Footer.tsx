import { Link } from 'react-router-dom'

const collectionsLinks = [
  ['Манты', 'Выпечка', 'Блины', 'Бургеры', 'Чебуреки', 'Кофе', 'Десерты', 'Фастфуд', 'Обед', 'Салаты', 'Хот-дог'],
  ['Хлеб', 'Пончики', 'Стейки', 'Суп', 'Поке', 'Каша', 'Шаурма', 'Торты', 'Пицца', 'Сырники', 'Пироги'],
  ['Роллы', 'Рамен', 'Шашлык', 'Итальянская кухня', 'Сэндвичи', 'Здоровая еда', 'Грузинская кухня', 'Овощи', 'Завтраки', 'Русская кухня'],
  ['Морепродукты', 'Вегетарианские блюда', 'Вок'],
]

const companyLinks = [
  'Пользовательские соглашения',
  'Контакты',
  'Вопросы и ответы',
  'Стать партнёром',
  'Стать курьером',
]

export default function Footer() {
  return (
    <footer className="bg-white mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-10 md:justify-between">
          {/* Подборки */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 md:mb-6">Подборки</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:gap-10 gap-x-4 gap-y-2">
              {collectionsLinks.map((col, i) => (
                <ul key={i} className="space-y-2 md:min-w-[120px]">
                  {col.map((label) => (
                    <li key={label}>
                      <Link
                        to={`/?category=${encodeURIComponent(label)}`}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          {/* О компании */}
          <div className="md:text-right">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 md:mb-6">О компании</h4>
            <ul className="space-y-2">
              {companyLinks.map((label) => (
                <li key={label}>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="mt-6 md:mt-10 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-gray-400">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Обратная связь
            </button>
          </div>
        </div>

        <p className="mt-10 md:mt-16 text-xs text-gray-400">© 2018—2026 ООО «MAVIN»</p>
      </div>
    </footer>
  )
}
