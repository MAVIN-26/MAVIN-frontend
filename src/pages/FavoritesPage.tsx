import { useEffect } from 'react'
import RestaurantCard from '../components/RestaurantCard'
import { useFavoritesStore } from '../store/favoritesStore'

export default function FavoritesPage() {
  const items = useFavoritesStore((s) => s.items)
  const loading = useFavoritesStore((s) => s.loading)
  const error = useFavoritesStore((s) => s.error)
  const fetch = useFavoritesStore((s) => s.fetch)

  useEffect(() => {
    if (items === null) fetch()
  }, [items, fetch])

  return (
    <section>
      <h1
        className="text-2xl text-[#0C0310] mb-6"
        style={{ fontFamily: "'Hachi Maru Pop', cursive" }}
      >
        Сохранённые рестораны
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {loading && (items === null || items.length === 0) ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="aspect-[4/3] w-full rounded-xl bg-[#EBEBEB] animate-pulse" />
              <div className="mt-3 h-4 w-2/3 rounded bg-[#EBEBEB] animate-pulse" />
            </div>
          ))}
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-[#616161] text-sm">
          Нет добавленных ресторанов
        </div>
      )}
    </section>
  )
}
