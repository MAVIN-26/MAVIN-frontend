import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { listAdminUsers, blockAdminUser } from '../../api/adminUsers'
import type { UserProfile } from '../../types/auth'
import { useDebounce } from '../../hooks/useDebounce'
import { useAuthStore } from '../../store/authStore'
import UserFormModal from '../../components/admin/UserFormModal'
import Spinner from '../../components/Spinner'
import { toast } from '../../store/toastStore'

const PAGE_SIZE = 20

type RoleFilter = 'all' | 'customer' | 'restaurant_admin'

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'customer', label: 'Покупатели' },
  { value: 'restaurant_admin', label: 'Адм. ресторанов' },
]

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user)

  const [items, setItems] = useState<UserProfile[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const debounced = useDebounce(search, 300)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [busyRowId, setBusyRowId] = useState<number | null>(null)

  // Reset to page 1 whenever filters change (search/role).
  useEffect(() => {
    setPage(1)
  }, [debounced, roleFilter])

  const query = useMemo(
    () => ({
      search: debounced.trim() || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
      page,
      limit: PAGE_SIZE,
    }),
    [debounced, roleFilter, page],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listAdminUsers(query)
      setItems(data.items)
      setPages(Math.max(1, data.pages))
      setError(null)
    } catch (e: unknown) {
      setError(apiMessage(e, 'Не удалось загрузить пользователей'))
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    load()
  }, [load])

  const toggleBlock = async (u: UserProfile) => {
    setBusyRowId(u.id)
    try {
      await blockAdminUser(u.id, !u.is_blocked)
      toast.success(u.is_blocked ? 'Пользователь разблокирован' : 'Пользователь заблокирован')
      await load()
    } catch (e: unknown) {
      toast.error(apiMessage(e, 'Не удалось изменить статус'))
    } finally {
      setBusyRowId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-[#0C0310]">Пользователи</h1>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени или телефону"
          className="flex-1 min-w-[240px] h-11 px-4 rounded-full border border-[#E5E5E5] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
        />
        <div className="flex items-center gap-2">
          {ROLE_TABS.map((t) => {
            const active = roleFilter === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setRoleFilter(t.value)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                  active
                    ? 'bg-[#FF7700] border-[#FF7700] text-white'
                    : 'bg-white border-[#E5E5E5] text-[#0C0310] hover:bg-[#F0F0F0]'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white border border-[#E5E5E5] rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFAFA] text-[#3C3C3C]">
            <tr>
              <Th>Имя</Th>
              <Th>Телефон</Th>
              <Th>Email</Th>
              <Th>Роль</Th>
              <Th>Подписка</Th>
              <Th>Статус</Th>
              <Th>Действия</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center">
                  <Spinner />
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-[#8C8C8C]">
                  Ничего не найдено
                </td>
              </tr>
            )}
            {!loading &&
              items.map((u) => {
                const isSelf = currentUser?.id === u.id
                return (
                  <tr key={u.id} className="border-t border-[#F0F0F0]">
                    <Td>
                      <span className="text-[#0C0310] font-medium">
                        {u.first_name} {u.last_name}
                      </span>
                    </Td>
                    <Td>{u.phone}</Td>
                    <Td className="break-all">{u.email}</Td>
                    <Td>
                      <RoleBadge role={u.role} />
                    </Td>
                    <Td>
                      {u.is_premium ? (
                        <span className="px-3 py-1 rounded-full bg-[#FF7700] text-white text-xs">
                          Студент+
                        </span>
                      ) : (
                        <span className="text-[#8C8C8C]">—</span>
                      )}
                    </Td>
                    <Td>
                      {u.is_blocked ? (
                        <span className="px-3 py-1 rounded-full bg-[#FF5757] text-[#0C0310] text-xs">
                          Заблокирован
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[#CCFF53] text-[#0C0310] text-xs">
                          Активен
                        </span>
                      )}
                    </Td>
                    <Td>
                      {isSelf ? (
                        <span className="text-xs text-[#8C8C8C]">—</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleBlock(u)}
                          disabled={busyRowId === u.id}
                          className="px-3 py-1 rounded-full bg-[#E5E5E5] text-[#0C0310] text-xs hover:bg-[#D9D9D9] disabled:opacity-60"
                        >
                          {u.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                        </button>
                      )}
                    </Td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded-full border border-[#E5E5E5] text-sm disabled:opacity-60"
          >
            ←
          </button>
          <span className="text-sm text-[#3C3C3C]">
            {page} / {pages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages || loading}
            className="px-3 py-1.5 rounded-full border border-[#E5E5E5] text-sm disabled:opacity-60"
          >
            →
          </button>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56A00]"
        >
          + Создать пользователя
        </button>
      </div>

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={() => {
          // After create, refresh current page to show the new row.
          load()
        }}
      />
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-xs font-medium px-4 py-3 whitespace-nowrap">
      {children}
    </th>
  )
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>
}

function RoleBadge({ role }: { role: UserProfile['role'] }) {
  if (role === 'restaurant_admin') {
    return (
      <span className="px-3 py-1 rounded-full bg-[#ECF7FB] text-[#1F7A9A] text-xs">
        Адм. ресторана
      </span>
    )
  }
  if (role === 'site_admin') {
    return (
      <span className="px-3 py-1 rounded-full bg-[#FFBA7D] text-[#FF7700] text-xs">
        Адм. сайта
      </span>
    )
  }
  return (
    <span className="px-3 py-1 rounded-full bg-[#F0F0F0] text-[#3C3C3C] text-xs">
      Покупатель
    </span>
  )
}

function apiMessage(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const detail = (e.response?.data as { detail?: string } | undefined)?.detail
    if (detail) return detail
  }
  return e instanceof Error ? e.message : fallback
}
