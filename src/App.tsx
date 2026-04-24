import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import OwnerLayout from './layouts/OwnerLayout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import { useNotificationStore } from './store/notificationStore'
import { toast } from './store/toastStore'
import { orderEventsClient } from './services/websocket'

import HomePage from './pages/HomePage'
import RestaurantPage from './pages/RestaurantPage'
import OrdersPage from './pages/OrdersPage'
import CheckoutPage from './pages/CheckoutPage'
import FavoritesPage from './pages/FavoritesPage'
import PromoPage from './pages/PromoPage'
import SubscriptionPage from './pages/SubscriptionPage'
import ProfilePage from './pages/ProfilePage'
import OwnerOrdersPage from './pages/owner/OwnerOrdersPage'
import OwnerOrdersHistoryPage from './pages/owner/OwnerOrdersHistoryPage'
import OwnerMenuPage from './pages/owner/OwnerMenuPage'
import OwnerRestaurantProfilePage from './pages/owner/OwnerRestaurantProfilePage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminPromoPage from './pages/admin/AdminPromoPage'
import AdminReferencesPage from './pages/admin/AdminReferencesPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  const { token, user, fetchMe } = useAuthStore()
  const fetchCart = useCartStore((s) => s.fetch)
  const resetCart = useCartStore((s) => s.reset)
  const addNotification = useNotificationStore((s) => s.add)
  const resetNotifications = useNotificationStore((s) => s.reset)

  useEffect(() => {
    if (token) {
      fetchMe()
    }
  }, [])

  // Load cart once the user is known and only for customers (owner/admin
  // don't have a cart). Reset on logout.
  useEffect(() => {
    if (user && user.role === 'customer') {
      fetchCart()
    } else {
      resetCart()
    }
  }, [user, fetchCart, resetCart])

  // Open WS /ws/orders for customers; close for guests/owner/admin and on logout.
  useEffect(() => {
    if (token && user && user.role === 'customer') {
      orderEventsClient.connect(token)
    } else {
      orderEventsClient.disconnect()
      resetNotifications()
    }
    return () => {
      orderEventsClient.disconnect()
    }
  }, [token, user, resetNotifications])

  // Funnel WS events into the notifications store + transient toast.
  useEffect(() => {
    return orderEventsClient.subscribe((event) => {
      if (event.event === 'order_status_changed') {
        addNotification({
          order_id: event.data.order_id,
          new_status: event.data.new_status,
          message: event.data.message,
        })
        toast.success(event.data.message)
      }
    })
  }, [addNotification])

  return (
    <BrowserRouter>
      <Routes>
        {/* Main (client) layout */}
        <Route element={<MainLayout />}>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants/:id" element={<RestaurantPage />} />

          {/* Protected: any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/promo" element={<PromoPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Restaurant-admin layout — top tabs + minimal header */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={['restaurant_admin']} />}>
            <Route path="/owner" element={<OwnerLayout />}>
              <Route index element={<Navigate to="/owner/menu" replace />} />
              <Route path="orders" element={<OwnerOrdersPage />} />
              <Route path="orders/history" element={<OwnerOrdersHistoryPage />} />
              <Route path="menu" element={<OwnerMenuPage />} />
              <Route path="profile" element={<OwnerRestaurantProfilePage />} />
            </Route>
          </Route>
        </Route>

        {/* Site-admin layout — separate chrome (sidebar + minimal header) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={['site_admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="restaurants" element={<AdminRestaurantsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="promo" element={<AdminPromoPage />} />
              <Route path="references" element={<AdminReferencesPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
