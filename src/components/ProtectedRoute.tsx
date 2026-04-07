import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute() {
  const { isAuthenticated, token } = useAuthStore()

  // token exists but user not yet loaded (fetchMe in progress) — wait
  if (token && !isAuthenticated) return null

  if (!isAuthenticated) return <Navigate to="/" replace />

  return <Outlet />
}
