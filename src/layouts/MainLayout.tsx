import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
