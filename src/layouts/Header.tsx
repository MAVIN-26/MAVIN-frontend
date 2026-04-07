import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MavinLogo from '../components/MavinLogo'
import LoginDropdown from '../components/LoginDropdown'
import UserDropdown from '../components/UserDropdown'

// Temporary stub — will be replaced by real auth store in FE-1.2
const useAuthStore = () => ({ isAuthenticated: false, user: null as null | { first_name: string; last_name: string } })

export default function Header() {
  const { isAuthenticated, user } = useAuthStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <MavinLogo />
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-[480px]">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Поиск"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Location */}
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="hidden sm:inline">Геолокация</span>
          </button>

          {/* Notifications */}
          <button className="relative p-1 text-gray-600 hover:text-gray-900 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>

          {/* Avatar / dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              {isAuthenticated && user
                ? user.first_name[0].toUpperCase()
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
              }
            </button>

            {dropdownOpen && (
              isAuthenticated && user
                ? <UserDropdown user={user} onClose={() => setDropdownOpen(false)} />
                : <LoginDropdown onClose={() => setDropdownOpen(false)} />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
