import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import {
  createAdminPromoCode,
  deleteAdminPromoCode,
  listAdminPromoCodes,
  updateAdminPromoCode,
} from '../../api/promo'
import type { PromoCode } from '../../types/promo'
import PromoCodeFormModal, {
  type SubmitBody,
} from '../../components/admin/PromoCodeFormModal'
import ConfirmDialog from '../../components/ConfirmDialog'
import Spinner from '../../components/Spinner'
import { toast } from '../../store/toastStore'

const PAGE_SIZE = 20

function formatExpires(iso: string | null | undefined): string {
  if (!iso) return 'Бессрочно'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

function isExpired(iso: string | null | undefined): boolean {
  if (!iso) return false
  const t = new Date(iso).getTime()
  return Number.isFinite(t) && t < Date.now()
}

export default function AdminPromoPage() {
  const [items, setItems] = useState<PromoCode[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<PromoCode | null>(null)

  const [toDelete, setToDelete] = useState<PromoCode | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const data = await listAdminPromoCodes({ page: p, limit: PAGE_SIZE })
      setItems(data.items)
      setPages(Math.max(1, data.pages))
      setError(null)
    } catch (e: unknown) {
      setError(apiMessage(e, 'Не удалось загрузить промокоды'))
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

  const openEdit = (p: PromoCode) => {
    setFormMode('edit')
    setEditing(p)
    setFormOpen(true)
  }

  const handleSubmit = async (body: SubmitBody) => {
    if (formMode === 'create') {
      await createAdminPromoCode({
        code: body.code,
        discount_percent: body.discount_percent,
        expires_at: body.expires_at,
      })
      toast.success('Промокод создан')
    } else if (editing) {
      await updateAdminPromoCode(editing.id, {
        is_active: body.is_active,
        discount_percent: body.discount_percent,
        expires_at: body.expires_at,
      })
      toast.success('Изменения сохранены')
    }
    setFormOpen(false)
    await load(page)
  }

  const handleDeleteConfirm = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteAdminPromoCode(toDelete.id)
      toast.success('Промокод удалён')
      setToDelete(null)
      const nextPage = items.length === 1 && page > 1 ? page - 1 : page
      if (nextPage !== page) setPage(nextPage)
      else await load(page)
    } catch (e: unknown) {
      toast.error(apiMessage(e, 'Не удалось удалить промокод'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#0C0310]">Промокоды</h1>
        <button
          type="button"
          onClick={openCreate}
          className="px-5 py-2.5 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E66A00]"
        >
          + Создать промокод
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
              <Th>Код</Th>
              <Th>Скидка</Th>
              <Th>Действует до</Th>
              <Th>Статус</Th>
              <Th>Действия</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center">
                  <Spinner />
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#8C8C8C]">
                  Пока нет промокодов
                </td>
              </tr>
            )}
            {!loading &&
              items.map((p) => {
                const expired = isExpired(p.expires_at)
                return (
                  <tr key={p.id} className="border-t border-[#F0F0F0]">
                    <Td>
                      <span className="font-medium text-[#0C0310] uppercase">
                        {p.code}
                      </span>
                    </Td>
                    <Td>{p.discount_percent}%</Td>
                    <Td>{formatExpires(p.expires_at)}</Td>
                    <Td>
                      {!p.is_active ? (
                        <Badge color="#8C8C8C">Неактивен</Badge>
                      ) : expired ? (
                        <Badge color="#D94B4B">Истёк</Badge>
                      ) : (
                        <Badge color="#2F8F2F">Активен</Badge>
                      )}
                    </Td>
                    <Td>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="px-3 py-1 rounded-full bg-[#FF7700] text-white text-xs hover:bg-[#E66A00]"
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(p)}
                          className="px-3 py-1 rounded-full bg-[#D94B4B] text-white text-xs hover:bg-[#C13E3E]"
                        >
                          Удалить
                        </button>
                      </div>
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

      <PromoCodeFormModal
        open={formOpen}
        mode={formMode}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Удалить промокод?"
        message={
          toDelete
            ? `Удалить промокод «${toDelete.code}»? Действие необратимо.`
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

function Badge({
  color,
  children,
}: {
  color: string
  children: React.ReactNode
}) {
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-white text-xs"
      style={{ backgroundColor: color }}
    >
      {children}
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
