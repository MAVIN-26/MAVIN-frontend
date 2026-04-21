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
    <header className="w-full bg-[#ECF7FB] sticky top-0 z-50 shadow-[0_10px_15px_rgba(0,0,0,0.05)]">
      <div className="max-w-[1920px] mx-auto px-14 h-[100px] flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <MavinLogo className="h-[65px] w-auto" />
        </Link>

        {/* Search — wide pill */}
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2"
              width="34"
              height="34"
              viewBox="0 0 34 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M33.69 32.186 23.4 21.796a13 13 0 1 0-1.774 1.82l10.275 10.377a1.04 1.04 0 0 0 1.497 0 1.04 1.04 0 0 0 0-1.807ZM13.238 24.464c-6.152 0-11.137-5.005-11.137-11.178S7.086 2.108 13.238 2.108c6.151 0 11.136 5.004 11.136 11.178 0 6.173-4.985 11.178-11.136 11.178Z"
                fill="#000"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Искать"
              className="w-full pl-[64px] pr-5 h-12 text-base bg-white rounded-[20px] placeholder-[#616161]/50 text-[#0C0310] focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 ml-auto shrink-0">
          {/* Location pill */}
          <button
            type="button"
            className="flex items-center gap-2 h-12 px-5 bg-white rounded-[20px] text-sm text-black hover:text-[#0C0310] transition-colors shrink-0"
          >
            <svg
              width="23"
              height="28"
              viewBox="0 0 23 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 11.125C3 6.867 6.77 3 11.75 3c4.99 0 8.75 3.867 8.75 8.125 0 2.681-1.64 5.676-3.8 8.451a51.41 51.41 0 0 1-4.95 5.417c-1.35-1.327-3.5-3.447-5.42-5.88C4.14 16.3 3 13.782 3 11.125ZM11.75 0.5C5.5.5.5 5.383.5 11.125c0 3.569 2.11 7.137 4.33 9.986 1.92 2.466 4.08 4.586 5.42 5.91.24.23.45.434.62.613.24.235.56.366.88.366.33 0 .65-.131.89-.366.18-.179.39-.384.63-.612 1.34-1.325 3.5-3.445 5.42-5.91 2.21-2.85 4.32-6.418 4.32-9.987C23 5.383 18.01.5 11.75.5Zm0 13.75a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                fill="#000"
              />
            </svg>
            <span>Геопозиция</span>
          </button>

          {/* Notifications — icon only, no bg */}
          <button
            type="button"
            className="flex items-center justify-center text-black hover:opacity-70 transition-opacity"
            aria-label="Уведомления"
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.2678 33.5458C13.9789 33.2793 14.7714 33.6398 15.0379 34.3508C16.0299 36.9976 18.7424 38.9584 22.0004 38.9584C22.3837 38.9584 22.7591 38.9312 23.1244 38.8791C23.8762 38.7717 24.5727 39.2941 24.6801 40.0458C24.7875 40.7976 24.2651 41.4941 23.5134 41.6014C23.0189 41.6721 22.5135 41.7084 22.0004 41.7084C17.6407 41.7084 13.8727 39.0777 12.4628 35.3159C12.1963 34.6048 12.5567 33.8123 13.2678 33.5458ZM28.9629 34.3508C29.2294 33.6397 30.0219 33.2794 30.733 33.5459C31.4441 33.8124 31.8044 34.6049 31.5379 35.316C30.9626 36.8508 29.9935 38.1973 28.7563 39.2519C28.1783 39.7445 27.3105 39.6753 26.8179 39.0974C26.3253 38.5195 26.3944 37.6516 26.9724 37.159C27.8709 36.3931 28.5588 35.4289 28.9629 34.3508Z"
                fill="#000"
              />
              <path
                d="M8.25164 17.8007V16.509C8.25164 14.339 8.72255 12.2779 9.56713 10.4326C9.88318 9.74215 10.6992 9.43861 11.3896 9.75464C12.0801 10.0707 12.3837 10.8867 12.0677 11.5772C11.3852 13.0683 11.0016 14.7395 11.0016 16.509V17.8007C11.0016 19.6114 10.4855 21.3853 9.51293 22.8995L9.51288 22.8995L7.48261 26.0604C6.10065 28.2119 7.19614 31.0704 9.48683 31.7188H9.48688C17.6797 34.038 26.3204 34.038 34.5131 31.7188H34.5132C36.804 31.0704 37.8994 28.2119 36.5174 26.0604V26.0604L34.4872 22.8995H34.4871C33.5146 21.3853 32.9984 19.6114 32.9984 17.8007V16.509C32.9984 10.127 28.0264 5.0415 22 5.0415C20.3192 5.0415 18.7286 5.43375 17.3051 6.13565C16.624 6.47148 15.7996 6.1916 15.4638 5.51051C15.128 4.82942 15.4078 4.00502 16.0889 3.66919C17.8799 2.7861 19.8855 2.2915 22 2.2915C29.6408 2.2915 35.7484 8.70554 35.7484 16.509V17.8007C35.7484 19.0906 36.1165 20.3476 36.8009 21.4133L38.8312 24.5741L38.885 24.6593C41.1134 28.2462 39.4171 33.119 35.3592 34.3365L35.2621 34.3648C26.5797 36.8226 17.4204 36.8226 8.73783 34.3648C4.57775 33.1872 2.84178 28.1969 5.16879 24.5741L7.19907 21.4133C7.88352 20.3477 8.25164 19.0907 8.25164 17.8007Z"
                fill="#000"
              />
            </svg>
          </button>

          {/* Avatar / dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleAvatar}
              className="flex items-center justify-center text-black hover:opacity-70 transition-opacity"
              aria-label="Аккаунт"
            >
              {isAuthenticated && user ? (
                <div className="w-[50px] h-[50px] rounded-full bg-[#FF7700] text-white flex items-center justify-center text-base font-medium">
                  {user.first_name[0].toUpperCase()}
                </div>
              ) : (
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M25 45a20 20 0 1 0 0-40 20 20 0 0 0 0 40Z"
                    fill="#616161"
                  />
                  <path
                    d="M30.78 18.5c0-3.47-2.81-6.28-6.28-6.28s-6.28 2.81-6.28 6.28 2.81 6.28 6.28 6.28 6.28-2.81 6.28-6.28Zm2.22 0c0 4.69-3.81 8.5-8.5 8.5S16 23.19 16 18.5 19.81 10 24.5 10s8.5 3.81 8.5 8.5Z"
                    fill="#000"
                  />
                  <path
                    d="M24.5 31c6.07 0 9.94 1.27 12.31 3.69 2.35 2.4 3 5.71 3.19 9.19l-2.17.12c-.19-3.38-.81-6.01-2.59-7.82C33.47 34.37 30.33 33.14 24.5 33.14s-8.97 1.23-10.74 3.03c-1.78 1.82-2.4 4.44-2.59 7.83L9 43.88c.19-3.48.84-6.79 3.19-9.19C14.56 32.27 18.43 31 24.5 31Z"
                    fill="#000"
                  />
                  <path
                    d="M0 24.5c0-4.64 1.22-9 3.35-12.75l1.86 1.1A23.24 23.24 0 0 0 2.15 24.5c0 12.87 10.23 23.3 22.85 23.3s22.85-10.43 22.85-23.3c0-12.87-10.23-22.5-22.85-22.5A22.65 22.65 0 0 0 13.73 5l-.98-2A24.8 24.8 0 0 1 25 0c13.81 0 25 10.42 25 24.5C50 38.58 38.81 50 25 50S0 38.58 0 24.5Z"
                    fill="#000"
                  />
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
              <RegisterDropdown onClose={() => setPanel(null)} />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
