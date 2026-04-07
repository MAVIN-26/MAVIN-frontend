import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
      <p className="text-lg font-semibold text-gray-700 mb-2">Страница не найдена</p>
      <p className="text-sm text-gray-500 mb-6">Возможно, она была удалена или адрес введён неверно.</p>
      <Link to="/" className="text-sm text-[#FF5500] hover:underline font-medium">
        На главную
      </Link>
    </div>
  )
}
