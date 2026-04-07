import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import { useAuthStore } from './store/authStore'

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
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
