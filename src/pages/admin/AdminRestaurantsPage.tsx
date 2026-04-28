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
          className="px-5 py-2.5 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56A00]"
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
                        className="px-3 py-1 rounded-full bg-[#FF7700] text-white text-xs hover:bg-[#E56A00]"
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
                        className="px-3 py-1 rounded-full bg-[#FF5757] text-white text-xs hover:bg-[#FF5757]"
                      >
                        Удалить
                      </button>
                    </div>
                  </Td>
                  <Td>
                    {r.is_active ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-[#CCFF53] text-white text-xs">
                        Активен
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full bg-[#FF5757] text-white text-xs">
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
    <svg width="14" height="14" viewBox="0 0 27 25" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12.5857 0.207104C13.1618 -0.0690402 13.8382 -0.0690293 14.4143 0.207104L14.4143 0.207065C14.9226 0.450687 15.1878 0.878824 15.3151 1.09927C15.4594 1.34914 15.6073 1.67298 15.755 1.99307L18.2198 7.33557L24.2406 7.9496C24.6013 7.98638 24.9658 8.02223 25.2563 8.07761C25.5086 8.12571 26.0002 8.23428 26.3941 8.61124L26.4128 8.62941L26.413 8.62964C26.8628 9.07372 27.0718 9.69542 26.978 10.31C26.8952 10.8524 26.5556 11.2283 26.3781 11.4133C26.1768 11.6231 25.9037 11.8591 25.6343 12.0936L25.6343 12.0936L21.1368 16.0095L22.3931 21.7315C22.4683 22.0743 22.5456 22.4203 22.5809 22.7044C22.612 22.9549 22.658 23.4518 22.395 23.9376L22.3951 23.9377C22.0969 24.4884 21.5496 24.8725 20.9155 24.9763L20.9152 24.9764C20.356 25.0677 19.8812 24.872 19.6441 24.766C19.3753 24.6458 19.0587 24.4679 18.7444 24.2928L13.5 21.3702L8.25567 24.2928C7.94145 24.4679 7.62474 24.6458 7.35601 24.766C7.11889 24.872 6.64413 25.0677 6.08493 24.9764L6.0846 24.9763C5.45092 24.8726 4.90334 24.4887 4.60509 23.9378L4.59296 23.915C4.34344 23.4365 4.38858 22.951 4.41921 22.7044C4.45447 22.4203 4.53177 22.0743 4.60702 21.7315L5.86315 16.0095L1.36583 12.0936L1.36579 12.0936C1.09642 11.859 0.823348 11.6231 0.622041 11.4133C0.444449 11.2283 0.104876 10.8524 0.0220631 10.3101L0.022023 10.31C-0.0717711 9.69532 0.13727 9.07354 0.587242 8.62945C0.984157 8.23772 1.48754 8.12646 1.74384 8.07761C2.03435 8.02223 2.39885 7.98638 2.75951 7.9496L8.78018 7.33561L11.3558 1.75353C11.4664 1.5157 11.5767 1.28668 11.685 1.09927C11.8123 0.878824 12.0774 0.450726 12.5857 0.207104ZM11.2213 8.55432L11.2213 8.55436C11.165 8.67623 11.0266 9.01407 10.7743 9.28475L10.7742 9.28483C10.5815 9.49153 10.3459 9.65699 10.0826 9.77028L10.0826 9.77024C9.73808 9.91847 9.36279 9.94127 9.22542 9.95528L9.22546 9.95531L3.65942 10.5229L7.81715 14.143C7.91697 14.2299 8.19161 14.4497 8.37996 14.75L8.39792 14.7793L8.39832 14.78C8.53751 15.0132 8.62634 15.2714 8.65919 15.5391L8.6622 15.565V15.5651C8.70166 15.9274 8.60816 16.2793 8.57951 16.4099L8.57947 16.41L7.41817 21.6998L12.2664 18.9981C12.3873 18.9306 12.7036 18.7369 13.0716 18.6611L13.0735 18.6608C13.3459 18.605 13.6272 18.6033 13.9002 18.6556L13.9266 18.6608L13.9285 18.6611C14.2965 18.7369 14.6127 18.9306 14.7337 18.9981L19.5819 21.6998L18.4206 16.41L18.4071 16.3509C18.3705 16.1908 18.3033 15.8819 18.3379 15.5648C18.3681 15.2874 18.4584 15.0202 18.6018 14.78C18.7903 14.4641 19.0807 14.232 19.1827 14.1432L19.1829 14.143L23.3407 10.5229L17.7746 9.95531C17.6371 9.9413 17.2619 9.91848 16.9174 9.77028L16.9171 9.77013C16.6548 9.65719 16.4193 9.49215 16.2263 9.28518C15.9736 9.01437 15.8349 8.67606 15.7789 8.55471L15.7787 8.55428L13.5 3.61517L11.2213 8.55432ZM13.5 1.98752L13.5 1.98764L13.8048 1.39422L13.5 1.98752ZM13.5 1.98764L13.5 1.98752L13.8048 1.39422L13.5 1.98764Z" />
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
