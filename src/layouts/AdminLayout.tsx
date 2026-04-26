import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import MavinLogo from '../components/MavinLogo'
import Footer from './Footer'
import ToastContainer from '../components/ToastContainer'
import { useAuthStore } from '../store/authStore'

// Sidebar items per design/site_admin/png/Main.png.
const navItems: { to: string; label: string; end?: boolean }[] = [
  { to: '/admin', label: 'Дашборд', end: true },
  { to: '/admin/restaurants', label: 'Рестораны' },
  { to: '/admin/users', label: 'Пользователи' },
  { to: '/admin/promo', label: 'Промокоды' },
  { to: '/admin/references', label: 'Справочники' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close drawer on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-[#ECF7FB]">
      <AdminHeader onBurgerClick={() => setSidebarOpen((v) => !v)} />
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 pt-6 lg:pt-8 pb-10 flex gap-6 lg:gap-10 relative">
        {/* Sidebar — visible from lg, drawer below */}
        <aside className="hidden lg:block w-56 shrink-0">
          <SidebarNav />
        </aside>

        {/* Mobile/tablet drawer */}
        {sidebarOpen && (
          <>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 z-30 bg-black/30"
              aria-label="Закрыть меню"
            />
            <aside className="lg:hidden fixed left-0 top-0 bottom-0 z-40 w-64 bg-[#ECF7FB] shadow-xl px-6 pt-6 pb-10 overflow-y-auto">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="mb-6 text-[#0C0310] text-2xl leading-none"
                aria-label="Закрыть"
              >
                ×
              </button>
              <SidebarNav />
            </aside>
          </>
        )}

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  )
}

function SidebarNav() {
  return (
    <nav className="flex flex-col gap-4">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          style={{ fontFamily: "'Hachi Maru Pop', cursive" }}
          className={({ isActive }) =>
            `text-base transition-colors ${
              isActive
                ? 'text-[#FF7700]'
                : 'text-black hover:text-[#FF7700]'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function AdminHeader({ onBurgerClick }: { onBurgerClick: () => void }) {
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
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 h-16 md:h-20 flex items-center gap-3">
        <button
          type="button"
          onClick={onBurgerClick}
          className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          aria-label="Меню"
        >
          <span className="block w-6 h-0.5 bg-black rounded" />
          <span className="block w-6 h-0.5 bg-black rounded" />
          <span className="block w-6 h-0.5 bg-black rounded" />
        </button>
        <MavinLogo />
        <div className="ml-auto relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-11 h-11 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#3C3C3C] hover:text-[#0C0310]"
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
                <div className="text-sm font-semibold text-[#0C0310] truncate">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-xs text-[#8C8C8C]">Администратор</div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await logout()
                  navigate('/')
                }}
                className="w-full text-left px-4 py-2 text-sm text-[#D94B4B] hover:bg-[#FAFAFA]"
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
