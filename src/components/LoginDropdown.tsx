// Placeholder — full implementation in FE-1.2
export default function LoginDropdown({ onClose: _onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-0 top-10 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-50">
      <h3 className="text-base font-semibold text-gray-900 mb-4">ВХОД</h3>
      <div className="space-y-3">
        <input
          type="email"
          placeholder="Почта"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
        />
        <p className="text-xs text-gray-500">
          Нет аккаунта?{' '}
          <button className="text-[#FF5500] hover:underline font-medium">
            Зарегистрироваться
          </button>
        </p>
        <button className="w-full bg-[#FF5500] hover:bg-[#E04A00] text-white text-sm font-medium py-2 rounded-lg transition-colors">
          Войти
        </button>
      </div>
    </div>
  )
}
