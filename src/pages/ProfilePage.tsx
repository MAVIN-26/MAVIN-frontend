import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import MyDataModal from '../components/MyDataModal'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const [openMyData, setOpenMyData] = useState(false)

  if (!user) {
    // ProtectedRoute keeps unauth users away, but guard anyway.
    return null
  }

  return (
    <div className="flex flex-col gap-6 max-w-[720px]">
      <h1 className="text-2xl font-semibold text-[#0C0310]">Профиль</h1>

      {/* «Студент+» placeholder — real subscription flow is in another phase. */}
      <Link
        to="/subscription"
        className="inline-flex self-start items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E66A00]"
      >
        Оформить студент+
      </Link>

      <section className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#0C0310]">
              Мои данные
            </h2>
            <dl className="mt-3 grid grid-cols-[120px_1fr] gap-y-2 text-sm">
              <dt className="text-[#8C8C8C]">Имя</dt>
              <dd className="text-[#0C0310]">{user.first_name}</dd>
              <dt className="text-[#8C8C8C]">Фамилия</dt>
              <dd className="text-[#0C0310]">{user.last_name}</dd>
              <dt className="text-[#8C8C8C]">Телефон</dt>
              <dd className="text-[#0C0310]">{user.phone}</dd>
              <dt className="text-[#8C8C8C]">Эл. почта</dt>
              <dd className="text-[#0C0310] break-all">{user.email}</dd>
            </dl>
          </div>
          <button
            type="button"
            onClick={() => setOpenMyData(true)}
            className="shrink-0 px-4 py-2 rounded-full border border-[#E5E5E5] text-sm text-[#0C0310] hover:bg-[#F0F0F0]"
          >
            Изменить
          </button>
        </div>
      </section>

      <MyDataModal open={openMyData} onClose={() => setOpenMyData(false)} />
    </div>
  )
}
