import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import RestaurantCard from '../components/RestaurantCard'
import CategoryTabs from '../components/CategoryTabs'
import { useRestaurants } from '../hooks/useRestaurants'

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const categoryIdRaw = searchParams.get('category_id')
  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : undefined

  const filters = useMemo(
    () => ({
      search: search || undefined,
      category_id: Number.isFinite(categoryId) ? categoryId : undefined,
    }),
    [search, categoryId],
  )

  const { items, page, pages, loading, error, loadMore } = useRestaurants(filters)

  return (
    <section>
      <h1
        className="text-2xl text-[#0C0310] mb-6"
        style={{ fontFamily: "'Hachi Maru Pop', cursive" }}
      >
        Рестораны
      </h1>

      <CategoryTabs />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="aspect-[4/3] w-full rounded-xl bg-[#EBEBEB] animate-pulse" />
              <div className="mt-3 h-4 w-2/3 rounded bg-[#EBEBEB] animate-pulse" />
            </div>
          ))}
        </div>
      ) : items.length === 0 && !loading ? (
        <div className="py-16 text-center text-[#616161] text-sm">
          Ничего не найдено
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}

      {page < pages && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="h-11 px-6 rounded-full bg-[#FF7700] text-white text-sm font-medium hover:bg-[#e66b00] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Загрузка...' : 'Показать ещё'}
          </button>
        </div>
      )}
    </section>
  )
}
