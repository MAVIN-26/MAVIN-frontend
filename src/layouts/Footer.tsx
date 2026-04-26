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
    <footer className="mt-auto">
      {/* Main footer section */}
      <div className="bg-[#ECF7FB]">
        <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-10 md:justify-between">
            {/* Подборки */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-black mb-4 md:mb-6">Подборки</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:gap-10 gap-x-4 gap-y-2">
                {collectionsLinks.map((col, i) => (
                  <ul key={i} className="space-y-2 md:min-w-[120px]">
                    {col.map((label) => (
                      <li key={label}>
                        <Link
                          to={`/?category=${encodeURIComponent(label)}`}
                          className="text-sm text-black hover:text-[#FF7700] transition-colors"
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
              <h4 className="text-sm font-bold text-black mb-4 md:mb-6">О компании</h4>
              <ul className="space-y-2">
                {companyLinks.map((label) => (
                  <li key={label}>
                    <a href="#" className="text-sm text-black hover:text-[#FF7700] transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>

              <button
                type="button"
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

      {/* Copyright strip */}
      <div className="bg-white border-t border-[#E4E4E4]">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <p className="text-xs text-[#777777]">© 2018—2026 ООО «MAVIN»</p>
        </div>
      </div>
    </footer>
  )
}
