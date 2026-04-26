import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ToastContainer from '../components/ToastContainer'
import CartConflictModal from '../components/CartConflictModal'
import AiAssistantWidget from '../components/AiAssistantWidget'

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
      <CartConflictModal />
      <AiAssistantWidget />
    </div>
  )
}
