import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import MavinLogo from '../components/MavinLogo'
import Footer from './Footer'
import ToastContainer from '../components/ToastContainer'
import { useAuthStore } from '../store/authStore'
import { ownerOrderEventsClient } from '../services/ownerWebsocket'

// Top tabs per design/restaurant_admin/png/Main screen.png.
const navItems: { to: string; label: string; end?: boolean }[] = [
  { to: '/owner/orders', label: 'Заказы' },
  { to: '/owner/menu', label: 'Меню' },
  { to: '/owner/profile', label: 'Профиль ресторана' },
]

export default function OwnerLayout() {
  const token = useAuthStore((s) => s.token)
  const role = useAuthStore((s) => s.user?.role)

  useEffect(() => {
    if (token && role === 'restaurant_admin') {
      ownerOrderEventsClient.connect(token)
    } else {
      ownerOrderEventsClient.disconnect()
    }
    return () => {
      ownerOrderEventsClient.disconnect()
    }
  }, [token, role])

  return (
    <div className="min-h-screen flex flex-col bg-[#ECF7FB]">
      <OwnerHeader />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-8 pt-6 pb-10">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  )
}

function OwnerHeader() {
  const { user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="w-full bg-[#ECF7FB] sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-8 h-20 flex items-center gap-8">
        <MavinLogo />
        <nav className="flex items-center gap-2 mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-5 py-2 rounded-full text-sm text-black transition-colors ${
                  isActive
                    ? 'bg-[#FF7700]'
                    : 'bg-white hover:bg-[#FF7700]/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-11 h-11 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#3C3C3C] hover:text-black"
            aria-label="Меню пользователя"
          >
            {user ? (
              <span className="text-sm font-medium">
                {user.first_name[0].toUpperCase()}
              </span>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </button>
          {open && user && (
            <div className="absolute right-0 top-12 w-56 bg-white border border-[#E5E5E5] rounded-xl shadow-lg py-2">
              <div className="px-4 py-2 border-b border-[#F0F0F0]">
                <div className="text-sm font-semibold text-black truncate">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-xs text-[#8C8C8C]">Администратор ресторана</div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await logout()
                  navigate('/')
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#FF5757] hover:bg-[#FAFAFA]"
              >
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
