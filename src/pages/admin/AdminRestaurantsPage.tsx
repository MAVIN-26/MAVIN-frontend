import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import {
  createAdminRestaurant,
  deleteAdminRestaurant,
  listAdminRestaurants,
  updateAdminRestaurant,
} from '../../api/adminRestaurants'
import type { RestaurantAdmin } from '../../types/restaurantAdmin'
import RestaurantFormModal, {
  type SubmitBody,
} from '../../components/admin/RestaurantFormModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import Spinner from '../../components/Spinner'
import { toast } from '../../store/toastStore'

const PAGE_SIZE = 20

export default function AdminRestaurantsPage() {
  const [items, setItems] = useState<RestaurantAdmin[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<RestaurantAdmin | null>(null)

  const [toDelete, setToDelete] = useState<RestaurantAdmin | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [busyRowId, setBusyRowId] = useState<number | null>(null)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const data = await listAdminRestaurants({ page: p, limit: PAGE_SIZE })
      setItems(data.items)
      setPages(Math.max(1, data.pages))
      setError(null)
    } catch (e: unknown) {
      setError(apiMessage(e, 'Не удалось загрузить список ресторанов'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page)
  }, [load, page])

  const openCreate = () => {
    setFormMode('create')
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (r: RestaurantAdmin) => {
    setFormMode('edit')
    setEditing(r)
    setFormOpen(true)
  }

  const handleSubmit = async (body: SubmitBody) => {
    if (formMode === 'create') {
      await createAdminRestaurant({
        name: body.name,
        pickup_address: body.pickup_address,
        restaurant_admin_id: body.restaurant_admin_id,
        category_ids: body.category_ids,
        preparation_time_min: body.preparation_time_min,
        preparation_time_max: body.preparation_time_max,
      })
      toast.success('Ресторан создан')
    } else if (editing) {
      await updateAdminRestaurant(editing.id, {
        name: body.name,
        pickup_address: body.pickup_address,
        restaurant_admin_id: body.restaurant_admin_id,
        category_ids: body.category_ids,
        preparation_time_min: body.preparation_time_min,
        preparation_time_max: body.preparation_time_max,
        description: body.description,
        photo_url: body.photo_url,
      })
      toast.success('Изменения сохранены')
    }
    setFormOpen(false)
    await load(page)
  }

  const toggleActive = async (r: RestaurantAdmin) => {
    setBusyRowId(r.id)
    try {
      await updateAdminRestaurant(r.id, { is_active: !r.is_active })
      toast.success(r.is_active ? 'Ресторан заблокирован' : 'Ресторан разблокирован')
      await load(page)
    } catch (e: unknown) {
      toast.error(apiMessage(e, 'Не удалось изменить статус'))
    } finally {
      setBusyRowId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteAdminRestaurant(toDelete.id)
      toast.success('Ресторан удалён')
      setToDelete(null)
      // If we removed the last item on the page, step back.
      const nextPage = items.length === 1 && page > 1 ? page - 1 : page
      if (nextPage !== page) setPage(nextPage)
      else await load(page)
    } catch (e: unknown) {
      toast.error(apiMessage(e, 'Не удалось удалить ресторан'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#0C0310]">Рестораны</h1>
        <button
          type="button"
          onClick={openCreate}
          className="px-5 py-2.5 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E66A00]"
        >
          + Создать ресторан
        </button>
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
              <Th>Фото</Th>
              <Th>Название</Th>
              <Th>Адрес самовывоза</Th>
              <Th>Администратор</Th>
              <Th>Категории</Th>
              <Th>Рейтинг</Th>
              <Th>Действия</Th>
              <Th>Статус</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center">
                  <Spinner />
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-[#8C8C8C]">
                  Пока нет ресторанов
                </td>
              </tr>
            )}
            {!loading &&
              items.map((r) => (
                <tr key={r.id} className="border-t border-[#F0F0F0] align-top">
                  <Td>
                    <div className="w-12 h-12 rounded-lg bg-[#E5E5E5] overflow-hidden">
                      {r.photo_url && (
                        <img
                          src={r.photo_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </Td>
                  <Td>
                    <span className="text-[#0C0310] font-medium">{r.name}</span>
                  </Td>
                  <Td>{r.pickup_address}</Td>
                  <Td>
                    {r.restaurant_admin ? (
                      <div className="text-[#0C0310]">
                        <div>
                          {r.restaurant_admin.first_name}{' '}
                          {r.restaurant_admin.last_name}
                        </div>
                        <div className="text-xs text-[#8C8C8C]">
                          {r.restaurant_admin.phone}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[#8C8C8C]">—</span>
                    )}
                  </Td>
                  <Td>
                    {r.categories.length === 0 ? (
                      <span className="text-[#8C8C8C]">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {r.categories.map((c) => (
                          <span
                            key={c.id}
                            className="px-2 py-0.5 rounded-full bg-[#F0F0F0] text-xs text-[#0C0310]"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1">
                      <StarIcon />
                      {r.average_rating.toFixed(1).replace('.', ',')}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex flex-col gap-1 items-start">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="px-3 py-1 rounded-full bg-[#FF7700] text-white text-xs hover:bg-[#E66A00]"
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(r)}
                        disabled={busyRowId === r.id}
                        className="px-3 py-1 rounded-full bg-[#E5E5E5] text-[#0C0310] text-xs hover:bg-[#D9D9D9] disabled:opacity-60"
                      >
                        {r.is_active ? 'Заблокировать' : 'Разблокировать'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(r)}
                        className="px-3 py-1 rounded-full bg-[#D94B4B] text-white text-xs hover:bg-[#C13E3E]"
                      >
                        Удалить
                      </button>
                    </div>
                  </Td>
                  <Td>
                    {r.is_active ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-[#2F8F2F] text-white text-xs">
                        Активен
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full bg-[#D94B4B] text-white text-xs">
                        Заблокирован
                      </span>
                    )}
                  </Td>
                </tr>
              ))}
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

      <RestaurantFormModal
        open={formOpen}
        mode={formMode}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Удалить ресторан?"
        message={
          toDelete
            ? `Удалить ресторан «${toDelete.name}»? Действие необратимо.`
            : ''
        }
        busy={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => (deleting ? undefined : setToDelete(null))}
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

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5 15.09 8.77 22 9.77l-5 4.87 1.18 6.88L12 18.27l-6.18 3.25L7 14.64l-5-4.87 6.91-1Z" />
    </svg>
  )
}

function apiMessage(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const detail = (e.response?.data as { detail?: string } | undefined)?.detail
    if (detail) return detail
  }
  return e instanceof Error ? e.message : fallback
}
