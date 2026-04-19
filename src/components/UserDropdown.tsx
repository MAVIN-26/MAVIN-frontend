import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface Props {
  user: { first_name: string; last_name: string }
  onClose: () => void
}

// Menu layout matches design/client/png/Profile.png:
// header (name + "В профиле") → 4 nav items → Выйти.
// "Аллергены" opens a modal on the profile page via ?modal=allergens.
const menuItems: { label: string; to: string }[] = [
  { label: 'Заказы', to: '/orders' },
  { label: 'Сохранённые рестораны', to: '/favorites' },
  { label: 'Промокоды', to: '/promo' },
  { label: 'Аллергены', to: '/profile?modal=allergens' },
]

export default function UserDropdown({ user, onClose }: Props) {
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="absolute right-0 top-12 w-64 bg-white border border-[#E5E5E5] rounded-xl shadow-lg py-2 z-50">
      <Link
        to="/profile"
        onClick={onClose}
        className="block px-4 py-3 border-b border-[#F0F0F0] hover:bg-[#FAFAFA]"
      >
        <div className="text-sm font-semibold text-[#0C0310] truncate">
          {user.first_name} {user.last_name}
        </div>
        <div className="text-xs text-[#FF7700] mt-0.5">В профиле</div>
      </Link>
      <ul className="py-1">
        {menuItems.map((item) => (
          <li key={item.label}>
            <Link
              to={item.to}
              onClick={onClose}
              className="block px-4 py-2 text-sm text-[#0C0310] hover:bg-[#FAFAFA] transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={async () => {
              await logout()
              onClose()
            }}
            className="w-full text-left px-4 py-2 text-sm text-[#D94B4B] hover:bg-[#FAFAFA] transition-colors"
          >
            Выйти
          </button>
        </li>
      </ul>
    </div>
  )
}
