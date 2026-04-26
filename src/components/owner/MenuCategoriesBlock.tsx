import { useState } from 'react'
import axios from 'axios'
import type { MenuCategory } from '../../types/menuCategory'
import {
  createOwnerMenuCategory,
  deleteOwnerMenuCategory,
  updateOwnerMenuCategory,
} from '../../api/ownerMenuCategories'
import { toast } from '../../store/toastStore'
import ConfirmDialog from '../ConfirmDialog'

interface Props {
  items: MenuCategory[]
  onChanged: () => Promise<void> | void
}

export default function MenuCategoriesBlock({ items, onChanged }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)
  const [toDelete, setToDelete] = useState<MenuCategory | null>(null)
  const [deleting, setDeleting] = useState(false)

  const startEdit = (c: MenuCategory) => {
    setEditingId(c.id)
    setEditingName(c.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const saveEdit = async (id: number) => {
    const name = editingName.trim()
    if (!name) return
    setBusy(true)
    try {
      await updateOwnerMenuCategory(id, { name })
      toast.success('Категория обновлена')
      setEditingId(null)
      setEditingName('')
      await onChanged()
    } catch (e: unknown) {
      toast.error(apiMessage(e, 'Не удалось обновить категорию'))
    } finally {
      setBusy(false)
    }
  }

  const addNew = async () => {
    const name = newName.trim()
    if (!name) return
    setBusy(true)
    try {
      await createOwnerMenuCategory(name, items.length)
      toast.success('Категория добавлена')
      setNewName('')
      await onChanged()
    } catch (e: unknown) {
      toast.error(apiMessage(e, 'Не удалось создать категорию'))
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteOwnerMenuCategory(toDelete.id)
      toast.success('Категория удалена')
      setToDelete(null)
      await onChanged()
    } catch (e: unknown) {
      toast.error(apiMessage(e, 'Не удалось удалить категорию'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[#3C3C3C] mr-2">Категории:</span>

        {items.length === 0 && (
          <span className="text-sm text-[#8C8C8C]">пока нет</span>
        )}

        {items.map((c) => {
          const isEditing = editingId === c.id
          if (isEditing) {
            return (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded-full bg-[#F0F0F0] pl-2 pr-1 py-1"
              >
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-7 w-36 px-2 rounded-full border border-[#E5E5E5] bg-white text-sm focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => saveEdit(c.id)}
                  disabled={busy}
                  className="text-xs px-2 py-1 rounded-full bg-[#FF7700] text-white hover:bg-[#E66A00] disabled:opacity-60"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs px-2 py-1 rounded-full bg-[#E5E5E5] text-[#0C0310] hover:bg-[#D9D9D9]"
                >
                  ×
                </button>
              </span>
            )
          }
          return (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 rounded-full bg-[#F0F0F0] pl-3 pr-1 py-1 text-sm text-[#0C0310]"
            >
              {c.name}
              <button
                type="button"
                onClick={() => startEdit(c)}
                className="ml-1 w-6 h-6 rounded-full hover:bg-[#E5E5E5] text-[#3C3C3C] flex items-center justify-center"
                aria-label="Редактировать"
                title="Редактировать"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1 1 0 0 0 0-1.41l-2.51-2.51a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 2-1.66Z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setToDelete(c)}
                className="w-6 h-6 rounded-full hover:bg-[#D94B4B]/10 text-[#D94B4B] flex items-center justify-center"
                aria-label="Удалить"
                title="Удалить"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </span>
          )
        })}

        <span className="inline-flex items-center gap-1 ml-auto">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addNew()
              }
            }}
            placeholder="Новая категория"
            className="h-8 px-3 rounded-full border border-[#E5E5E5] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40"
          />
          <button
            type="button"
            onClick={addNew}
            disabled={busy || !newName.trim()}
            className="px-3 py-1.5 rounded-full bg-[#FF7700] text-white text-xs hover:bg-[#E66A00] disabled:opacity-60"
          >
            Добавить
          </button>
        </span>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Удалить категорию?"
        message={
          toDelete
            ? `Удалить категорию «${toDelete.name}»? Удалить можно только если в ней нет блюд.`
            : ''
        }
        busy={deleting}
        onConfirm={handleDelete}
        onClose={() => (deleting ? undefined : setToDelete(null))}
      />
    </div>
  )
}

function apiMessage(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const detail = (e.response?.data as { detail?: string } | undefined)?.detail
    if (detail) return detail
  }
  return e instanceof Error ? e.message : fallback
}
