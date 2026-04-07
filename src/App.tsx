import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import { useAuthStore } from './store/authStore'

import HomePage from './pages/HomePage'
import RestaurantPage from './pages/RestaurantPage'
import OrdersPage from './pages/OrdersPage'
import FavoritesPage from './pages/FavoritesPage'
import PromoPage from './pages/PromoPage'
import SubscriptionPage from './pages/SubscriptionPage'
import ProfilePage from './pages/ProfilePage'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  const { token, fetchMe } = useAuthStore()

  useEffect(() => {
    if (token) {
      fetchMe()
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants/:id" element={<RestaurantPage />} />

          {/* Protected: any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/promo" element={<PromoPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Protected: restaurant_admin only */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute roles={['restaurant_admin']} />}>
              <Route path="/owner/*" element={<OwnerDashboard />} />
            </Route>
          </Route>

          {/* Protected: site_admin only */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute roles={['site_admin']} />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
