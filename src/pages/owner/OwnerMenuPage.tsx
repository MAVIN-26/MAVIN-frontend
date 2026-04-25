import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  createOwnerMenuItem,
  deleteOwnerMenuItem,
  listOwnerMenu,
  setOwnerMenuItemAvailability,
  updateOwnerMenuItem,
} from '../../api/ownerMenu'
import { listOwnerMenuCategories } from '../../api/ownerMenuCategories'
import type { MenuItemOwner, MenuItemCreateBody } from '../../types/menuItemOwner'
import type { MenuCategory } from '../../types/menuCategory'
import DishFormModal from '../../components/owner/DishFormModal'
import MenuCategoriesBlock from '../../components/owner/MenuCategoriesBlock'
import ConfirmDialog from '../../components/ConfirmDialog'
import Spinner from '../../components/Spinner'
import { toast } from '../../store/toastStore'

export default function OwnerMenuPage() {
  const [items, setItems] = useState<MenuItemOwner[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<MenuItemOwner | null>(null)
  const [busyRowId, setBusyRowId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<MenuItemOwner | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [menu, cats] = await Promise.all([
        listOwnerMenu(),
        listOwnerMenuCategories(),
      ])
      setItems(menu)
      setCategories(cats)
      setError(null)
    } catch (e: unknown) {
      setError(apiMessage(e, 'Не удалось загрузить меню'))
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCategories = useCallback(async () => {
    const cats = await listOwnerMenuCategories()
    setCategories(cats)
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const categoryById = useMemo(() => {
    const m = new Map<number, MenuCategory>()
    for (const c of categories) m.set(c.id, c)
    return m
  }, [categories])

  const openCreate = () => {
    if (categories.length === 0) {
      toast.error('Сначала создайте хотя бы одну категорию меню')
      return
    }
    setFormMode('create')
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (m: MenuItemOwner) => {
    setFormMode('edit')
    setEditing(m)
    setFormOpen(true)
  }

  const handleSubmit = async (body: MenuItemCreateBody) => {
    if (formMode === 'create') {
      await createOwnerMenuItem(body)
      toast.success('Блюдо добавлено')
    } else if (editing) {
      await updateOwnerMenuItem(editing.id, body)
      toast.success('Изменения сохранены')
    }
    setFormOpen(false)
    await loadAll()
  }

  const toggleAvailability = async (m: MenuItemOwner, next: boolean) => {
    if (m.is_available === next) return
    setBusyRowId(m.id)
    try {
      await setOwnerMenuItemAvailability(m.id, next)
      setItems((list) =>
        list.map((x) => (x.id === m.id ? { ...x, is_available: next } : x)),
      )
    } catch (e: unknown) {
      toast.error(apiMessage(e, 'Не удалось изменить доступность'))
    } finally {
      setBusyRowId(null)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteOwnerMenuItem(toDelete.id)
      toast.success('Блюдо удалено')
      setToDelete(null)
      await loadAll()
    } catch (e: unknown) {
      toast.error(apiMessage(e, 'Не удалось удалить блюдо'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#0C0310]">Меню</h1>
      </div>

      <MenuCategoriesBlock items={categories} onChanged={loadCategories} />

      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 text-[#8C8C8C]">
          Пока нет блюд. Добавьте первое.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-[#E5E5E5] rounded-2xl px-4 py-3 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-lg bg-[#F0F0F0] overflow-hidden shrink-0">
                {m.photo_url && (
                  <img
                    src={m.photo_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-6 gap-y-1">
                <div className="min-w-[180px]">
                  <div className="text-[#0C0310] font-medium truncate">{m.name}</div>
                  <div className="text-xs text-[#8C8C8C] truncate">
                    {categoryById.get(m.menu_category_id)?.name ?? '—'}
                  </div>
                </div>
                <div className="text-sm text-[#0C0310]">
                  Цена: <span className="font-medium">{m.price}</span> ₽
                </div>
                <div className="text-sm text-[#3C3C3C]">
                  КБЖУ: {fmt(m.calories)} / {fmt(m.proteins)} / {fmt(m.fats)} /{' '}
                  {fmt(m.carbs)}
                </div>
                <div className="text-sm text-[#3C3C3C] min-w-0">
                  Аллергены:{' '}
                  {m.allergens.length === 0 ? (
                    <span className="text-[#8C8C8C]">—</span>
                  ) : (
                    <span className="text-[#0C0310]">
                      {m.allergens.map((a) => a.name).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name={`avail-${m.id}`}
                    checked={m.is_available}
                    disabled={busyRowId === m.id}
                    onChange={() => toggleAvailability(m, true)}
                  />
                  Доступно
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name={`avail-${m.id}`}
                    checked={!m.is_available}
                    disabled={busyRowId === m.id}
                    onChange={() => toggleAvailability(m, false)}
                  />
                  В стоп-листе
                </label>
              </div>
              <div className="flex flex-col gap-1 items-stretch">
                <button
                  type="button"
                  onClick={() => openEdit(m)}
                  className="px-3 py-1 rounded-full bg-[#FF7700] text-white text-xs hover:bg-[#E66A00]"
                >
                  Редактировать
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(m)}
                  className="px-3 py-1 rounded-full bg-[#D94B4B] text-white text-xs hover:bg-[#C13E3E]"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={openCreate}
          className="px-5 py-2.5 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E66A00]"
        >
          Добавить блюдо
        </button>
      </div>

      <DishFormModal
        open={formOpen}
        mode={formMode}
        initial={editing}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Удалить блюдо?"
        message={toDelete ? `Удалить «${toDelete.name}»? Действие необратимо.` : ''}
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => (deleting ? undefined : setToDelete(null))}
      />
    </div>
  )
}

function fmt(v: number | null | undefined): string {
  if (v == null) return '—'
  return String(v)
}

function apiMessage(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const detail = (e.response?.data as { detail?: string } | undefined)?.detail
    if (detail) return detail
  }
  return e instanceof Error ? e.message : fallback
}
