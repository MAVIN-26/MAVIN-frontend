import { Link } from 'react-router-dom'

interface Props {
  user: { first_name: string; last_name: string }
  onClose: () => void
}

const menuItems = [
  { label: 'Заказы', to: '/orders' },
  { label: 'Сохранённые рестораны', to: '/favorites' },
  { label: 'Промокоды', to: '/promo' },
  { label: 'Аллергены', to: '/profile' },
  { label: 'Мои данные', to: '/profile' },
  { label: 'Управление подпиской', to: '/subscription' },
]

export default function UserDropdown({ user, onClose }: Props) {
  return (
    <div className="absolute right-0 top-10 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
      <div className="px-4 py-2 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
      </div>
      <ul className="py-1">
        {menuItems.map((item) => (
          <li key={item.label}>
            <Link
              to={item.to}
              onClick={onClose}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={onClose}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 transition-colors"
          >
            Выйти
          </button>
        </li>
      </ul>
    </div>
  )
}
