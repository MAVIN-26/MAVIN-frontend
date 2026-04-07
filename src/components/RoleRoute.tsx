import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { UserProfile } from '../types/auth'

interface Props {
  roles: UserProfile['role'][]
}

export default function RoleRoute({ roles }: Props) {
  const user = useAuthStore((s) => s.user)

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-6xl font-bold text-gray-200 mb-4">403</p>
        <p className="text-lg font-semibold text-gray-700 mb-2">Нет доступа</p>
        <p className="text-sm text-gray-500">У вас недостаточно прав для просмотра этой страницы.</p>
      </div>
    )
  }

  return <Outlet />
}
