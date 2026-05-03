import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { getAllergens } from '../../api/allergens'
import { getCategories } from '../../api/categories'
import {
  createAllergen,
  updateAllergen,
  deleteAllergen,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/adminReferences'
import ConfirmDialog from '../../components/ConfirmDialog'
import Spinner from '../../components/Spinner'
import { toast } from '../../store/toastStore'

interface RefItem {
  id: number
  name: string
}

export default function AdminReferencesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#0C0310] mb-6">
        Справочники
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ReferenceColumn
          title="Аллергены"
          load={getAllergens}
          create={createAllergen}
          update={updateAllergen}
          remove={deleteAllergen}
          addLabel="Добавить аллерген"
          removeDialogTitle="Удалить аллерген?"
          removeDialogMessage={(name) =>
            `Удалить аллерген «${name}»? Действие необратимо.`
          }
        />
        <ReferenceColumn
          title="Категории кухни"
          load={getCategories}
          create={createCategory}
          update={updateCategory}
          remove={deleteCategory}
          addLabel="Добавить категорию"
          removeDialogTitle="Удалить категорию?"
          removeDialogMessage={(name) =>
            `Удалить категорию «${name}»? Действие необратимо.`
          }
        />
      </div>
    </div>
  )
}

interface ColumnProps {
  title: string
  load: () => Promise<RefItem[]>
  create: (name: string) => Promise<RefItem>
  update: (id: number, name: string) => Promise<RefItem>
  remove: (id: number) => Promise<void>
  addLabel: string
  removeDialogTitle: string
  removeDialogMessage: (name: string) => string
}

function ReferenceColumn({
  title,
  load,
  create,
  update,
  remove,
  addLabel,
  removeDialogTitle,
  removeDialogMessage,
}: ColumnProps) {
  const [items, setItems] = useState<RefItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<RefItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await load()
      setItems(data)
      setLoadError(null)
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Не удалось загрузить данные'
      setLoadError(message)
    } finally {
      setLoading(false)
    }
  }, [load])

  useEffect(() => {
    refresh()
  }, [refresh])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) => it.name.toLowerCase().includes(q))
  }, [items, search])

  const startEdit = (item: RefItem) => {
    setEditingId(item.id)
    setEditingName(item.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleSaveEdit = async (id: number) => {
    const name = editingName.trim()
    if (!name) {
      toast.error('Название не может быть пустым')
      return
    }
    setSavingId(id)
    try {
      const updated = await update(id, name)
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)))
      toast.success('Изменения сохранены')
      cancelEdit()
    } catch (e: unknown) {
      toast.error(extractApiMessage(e, 'Не удалось сохранить'))
    } finally {
      setSavingId(null)
    }
  }

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      const created = await create(name)
      setItems((prev) => [...prev, created])
      setNewName('')
      toast.success('Добавлено')
    } catch (e: unknown) {
      toast.error(extractApiMessage(e, 'Не удалось добавить'))
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await remove(toDelete.id)
      setItems((prev) => prev.filter((it) => it.id !== toDelete.id))
      toast.success('Удалено')
      setToDelete(null)
    } catch (e: unknown) {
      toast.error(extractApiMessage(e, 'Не удалось удалить'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-[#0C0310]">{title}</h2>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск названия"
        className="h-10 px-4 rounded-full border border-[#E5E5E5] bg-white text-sm text-[#0C0310] focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
      />

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Название"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newName.trim()) handleCreate()
          }}
          className="flex-1 h-10 px-4 rounded-full border border-[#E5E5E5] bg-white text-sm text-[#0C0310] focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="shrink-0 px-5 py-2 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56A00] disabled:opacity-60"
        >
          {addLabel}
        </button>
      </div>

      {loadError && (
        <div className="text-sm text-red-600" role="alert">
          {loadError}
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.length === 0 && (
            <li className="text-sm text-[#8C8C8C] py-2">Ничего не найдено</li>
          )}
          {visible.map((item) => {
            const isEditing = editingId === item.id
            const isSaving = savingId === item.id
            return (
              <li
                key={item.id}
                className="flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-xl px-3 py-2"
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                    className="flex-1 h-9 px-3 rounded-lg border border-[#E5E5E5] text-sm text-[#0C0310] focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
                  />
                ) : (
                  <span className="flex-1 text-sm text-[#0C0310] truncate">
                    {item.name}
                  </span>
                )}

                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(item.id)}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-full bg-[#FF7700] text-[#0C0310] text-xs hover:bg-[#E56A00] disabled:opacity-60"
                    >
                      {isSaving ? 'Сохраняем…' : 'Сохранить'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-full text-[#3C3C3C] text-xs hover:bg-[#F0F0F0]"
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="px-3 py-1.5 rounded-full border border-[#E5E5E5] text-xs text-[#0C0310] hover:bg-[#F0F0F0]"
                    >
                      Редактировать
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(item)}
                      className="px-3 py-1.5 rounded-full bg-[#FF5757] text-[#0C0310] text-xs hover:bg-[#FF5757]"
                    >
                      Удалить
                    </button>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={removeDialogTitle}
        message={toDelete ? removeDialogMessage(toDelete.name) : ''}
        busy={deleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => (deleting ? undefined : setToDelete(null))}
      />
    </section>
  )
}

// Prefer server's detail message on 4xx; fall back to generic.
function extractApiMessage(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const detail = (e.response?.data as { detail?: string } | undefined)?.detail
    if (detail) return detail
  }
  return e instanceof Error ? e.message : fallback
}
