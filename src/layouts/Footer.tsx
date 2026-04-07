import { Link } from 'react-router-dom'
import MavinLogo from '../components/MavinLogo'

const collectionsLinks = [
  ['Все', 'Суши', 'Бургеры', 'Пицца'],
  ['Здоровая еда', 'Десерты', 'Напитки', 'Азиатская'],
  ['Европейская', 'Вегетарианская', 'Завтраки', 'Обеды'],
]

const companyLinks = [
  'О сервисе',
  'Пресс-центр',
  'Блог',
  'Карьера',
  'Стать партнёром',
  'Пользовательское соглашение',
  'Политика конфиденциальности',
]

export default function Footer() {
  return (
    <footer className="bg-[#EAF0FB] mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-10 justify-between">
          {/* Подборки */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Подборки</h4>
            <div className="flex gap-8">
              {collectionsLinks.map((col, i) => (
                <ul key={i} className="space-y-2">
                  {col.map((label) => (
                    <li key={label}>
                      <Link to={`/?category=${encodeURIComponent(label)}`} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          {/* О компании */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">О компании</h4>
            <ul className="space-y-2">
              {companyLinks.map((label) => (
                <li key={label}>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-300 flex items-center justify-between">
          <MavinLogo />
          <p className="text-xs text-gray-400">© 2025 ООО «MAVIN»</p>
        </div>
      </div>
    </footer>
  )
}
