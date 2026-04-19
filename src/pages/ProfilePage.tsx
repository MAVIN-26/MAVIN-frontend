import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import MyDataModal from '../components/MyDataModal'
import MyAllergensModal from '../components/MyAllergensModal'
import PasswordChangeModal from '../components/PasswordChangeModal'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const [openMyData, setOpenMyData] = useState(false)
  const [openAllergens, setOpenAllergens] = useState(false)
  const [openPassword, setOpenPassword] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()

  // Allow opening the allergens modal from any page via ?modal=allergens
  // (header dropdown uses this entry point). We consume the param immediately
  // so a refresh doesn't re-open the modal.
  useEffect(() => {
    const modal = searchParams.get('modal')
    if (modal === 'allergens') {
      setOpenAllergens(true)
      const next = new URLSearchParams(searchParams)
      next.delete('modal')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

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

      <section className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-[#0C0310]">
              Мои аллергены
            </h2>
            <div className="mt-3 text-sm">
              {user.allergens.length === 0 ? (
                <span className="text-[#8C8C8C]">Не указаны</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.allergens.map((a) => (
                    <span
                      key={a.id}
                      className="px-3 py-1 rounded-full bg-[#FFF6EC] text-[#FF7700] text-xs"
                    >
                      {a.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpenAllergens(true)}
            className="shrink-0 px-4 py-2 rounded-full border border-[#E5E5E5] text-sm text-[#0C0310] hover:bg-[#F0F0F0]"
          >
            Изменить
          </button>
        </div>
      </section>

      <section className="bg-white border border-[#E5E5E5] rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#0C0310]">Пароль</h2>
            <p className="mt-1 text-sm text-[#8C8C8C]">
              Регулярно обновляйте пароль для безопасности аккаунта.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpenPassword(true)}
            className="shrink-0 px-4 py-2 rounded-full border border-[#E5E5E5] text-sm text-[#0C0310] hover:bg-[#F0F0F0]"
          >
            Сменить пароль
          </button>
        </div>
      </section>

      <MyDataModal open={openMyData} onClose={() => setOpenMyData(false)} />
      <MyAllergensModal
        open={openAllergens}
        onClose={() => setOpenAllergens(false)}
      />
      <PasswordChangeModal
        open={openPassword}
        onClose={() => setOpenPassword(false)}
      />
    </div>
  )
}
