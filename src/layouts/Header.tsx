import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import MavinLogo from '../components/MavinLogo'
import LoginDropdown from '../components/LoginDropdown'
import RegisterDropdown from '../components/RegisterDropdown'
import UserDropdown from '../components/UserDropdown'
import { useAuthStore } from '../store/authStore'
import { useDebounce } from '../hooks/useDebounce'

type Panel = 'login' | 'register' | null

export default function Header() {
  const { isAuthenticated, user } = useAuthStore()
  const [panel, setPanel] = useState<Panel>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Search field value, seeded from URL ?search=
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const debouncedSearch = useDebounce(search, 300)
  const lastPushedRef = useRef(search)

  // Keep input in sync if URL changes externally (e.g. nav)
  useEffect(() => {
    const urlSearch = searchParams.get('search') ?? ''
    if (urlSearch !== lastPushedRef.current) {
      setSearch(urlSearch)
      lastPushedRef.current = urlSearch
    }
  }, [searchParams])

  // Push debounced value to URL; switch to catalog if not there
  useEffect(() => {
    if (debouncedSearch === lastPushedRef.current) return
    lastPushedRef.current = debouncedSearch

    if (location.pathname !== '/') {
      const next = new URLSearchParams()
      if (debouncedSearch) next.set('search', debouncedSearch)
      navigate({ pathname: '/', search: next.toString() ? `?${next.toString()}` : '' })
      return
    }

    const next = new URLSearchParams(searchParams)
    if (debouncedSearch) next.set('search', debouncedSearch)
    else next.delete('search')
    setSearchParams(next, { replace: true })
  }, [debouncedSearch])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPanel(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleAvatar = () => {
    if (isAuthenticated) {
      setPanel((v) => (v === 'login' ? null : 'login'))
    } else {
      setPanel((v) => (v ? null : 'login'))
    }
  }

  return (
    <header className="w-full bg-[#ECF7FB] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-8 h-20 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <MavinLogo />
        </Link>

        {/* Search — wide pill */}
        <div className="flex-1 max-w-[780px]">
          <div className="relative">
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 text-[#616161]"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Искать"
              className="w-full pl-12 pr-5 h-11 text-sm bg-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)] placeholder-[#616161] text-[#0C0310] focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Location pill */}
          <button
            type="button"
            className="flex items-center gap-2 h-11 px-4 bg-white rounded-full text-sm text-[#3C3C3C] shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:text-[#0C0310] transition-colors shrink-0"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Геопозиция</span>
          </button>

          {/* Notifications — round */}
          <button
            type="button"
            className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)] text-[#3C3C3C] hover:text-[#0C0310] transition-colors"
          >
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
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>

          {/* Avatar / dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleAvatar}
              className="w-11 h-11 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex items-center justify-center text-[#3C3C3C] text-sm font-medium hover:text-[#0C0310] transition-colors"
            >
              {isAuthenticated && user ? (
                user.first_name[0].toUpperCase()
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

            {panel && isAuthenticated && user && (
              <UserDropdown user={user} onClose={() => setPanel(null)} />
            )}
            {panel === 'login' && !isAuthenticated && (
              <LoginDropdown
                onClose={() => setPanel(null)}
                onSwitchToRegister={() => setPanel('register')}
              />
            )}
            {panel === 'register' && !isAuthenticated && (
              <RegisterDropdown
                onClose={() => setPanel(null)}
                onSwitchToLogin={() => setPanel('login')}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
