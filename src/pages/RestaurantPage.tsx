import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRestaurant } from '../hooks/useRestaurant'
import { useFavoriteToggle } from '../hooks/useFavoriteToggle'
import { useMenu } from '../hooks/useMenu'
import { useMenuCategories } from '../hooks/useMenuCategories'
import { useMenuFilters } from '../hooks/useMenuFilters'
import UserChoiceSection from '../components/UserChoiceSection'
import MenuCategoriesNav, {
  ALL_ID,
  USER_CHOICE_ID,
  categoryId,
} from '../components/MenuCategoriesNav'
import MenuCategorySection from '../components/MenuCategorySection'
import KbjuFilter from '../components/KbjuFilter'
import AllergensFilter from '../components/AllergensFilter'
import DishModal from '../components/DishModal'
import CartSidebar from '../components/CartSidebar'
import Spinner from '../components/Spinner'
import { useCartStore } from '../store/cartStore'
import type { RestaurantPublic } from '../types/restaurant'
import type { MenuItemPublic } from '../types/menuItem'

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = id ? Number(id) : null
  const { data, loading, error } = useRestaurant(restaurantId)

  return (
    <div className="flex flex-col gap-6">
      {loading && <HeaderSkeleton />}
      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && data && <RestaurantContent restaurant={data} />}
    </div>
  )
}

function RestaurantContent({ restaurant }: { restaurant: RestaurantPublic }) {
  const restaurantId = restaurant.id
  const {
    filters,
    kbjuActive,
    allergensActive,
    excludeAllergenIds,
    setKbju,
    setExcludeAllergenIds,
  } = useMenuFilters()

  const {
    items: menu,
    loading: menuLoading,
    error: menuError,
  } = useMenu(restaurantId, filters)
  const {
    items: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useMenuCategories(restaurantId)

  const [userChoiceEmpty, setUserChoiceEmpty] = useState(false)
  const [openFilter, setOpenFilter] = useState<'kbju' | 'allergens' | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItemPublic | null>(null)

  const addToCart = useCartStore((s) => s.add)
  const handleCardAdd = (item: MenuItemPublic) => {
    addToCart(item.id, 1)
  }

  // Group menu items by category in the same order categories come from API.
  const itemsByCategory = useMemo(() => {
    const map = new Map<number, MenuItemPublic[]>()
    for (const cat of categories) map.set(cat.id, [])
    for (const item of menu) {
      const list = map.get(item.menu_category_id)
      if (list) list.push(item)
      // Items whose category is not in the list are skipped — by contract
      // menu_category_id always references a category of this restaurant.
    }
    return map
  }, [menu, categories])

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-6 pb-20 lg:pb-0">
      <RestaurantHeader restaurant={restaurant} />

      <div className="rounded-2xl bg-[#FAFAFA] p-4 flex flex-col gap-6">
        <MenuCategoriesNav
          categories={categories}
          hasUserChoice={!userChoiceEmpty}
          kbjuActive={kbjuActive}
          allergensActive={allergensActive}
          onOpenKbju={() =>
            setOpenFilter((f) => (f === 'kbju' ? null : 'kbju'))
          }
          onOpenAllergens={() =>
            setOpenFilter((f) => (f === 'allergens' ? null : 'allergens'))
          }
          kbjuSlot={
            <KbjuFilter
              open={openFilter === 'kbju'}
              initial={filters}
              onClose={() => setOpenFilter(null)}
              onApply={setKbju}
            />
          }
          allergensSlot={
            <AllergensFilter
              open={openFilter === 'allergens'}
              initialIds={excludeAllergenIds}
              onClose={() => setOpenFilter(null)}
              onApply={setExcludeAllergenIds}
            />
          }
        />

        {/* Anchor for the "Все" tab — whole menu area starts here. */}
        <div id={ALL_ID} className="scroll-mt-24" />

        <UserChoiceSection
          restaurantId={restaurantId}
          id={USER_CHOICE_ID}
          onEmptyChange={setUserChoiceEmpty}
          onItemClick={setSelectedItem}
          onItemAdd={handleCardAdd}
        />

        {menuLoading && <Spinner label="Загрузка меню…" />}
        {menuError && (
          <div className="text-sm text-red-600" role="alert">
            {menuError}
          </div>
        )}
        {categoriesError && (
          <div className="text-sm text-red-600" role="alert">
            {categoriesError}
          </div>
        )}

        {!menuLoading && !categoriesLoading && (
          <>
            {categories.map((cat) => (
              <MenuCategorySection
                key={cat.id}
                id={categoryId(cat.id)}
                title={cat.name}
                items={itemsByCategory.get(cat.id) ?? []}
                onItemClick={setSelectedItem}
                onItemAdd={handleCardAdd}
              />
            ))}
            {categories.length === 0 && menu.length === 0 && (
              <div className="text-sm text-[#8C8C8C]">Меню пока пустое</div>
            )}
          </>
        )}
      </div>

      <DishModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      </div>
      <CartSidebar restaurantId={restaurantId} menuItems={menu} />
    </div>
  )
}

function RestaurantHeader({ restaurant }: { restaurant: RestaurantPublic }) {
  const navigate = useNavigate()
  const {
    name,
    average_rating,
    review_count,
    preparation_time_min,
    preparation_time_max,
    pickup_address,
    categories,
  } = restaurant

  const rating = average_rating?.toFixed(1).replace('.', ',') ?? '—'
  const prep = formatPrepTime(preparation_time_min, preparation_time_max)

  const { isFavorite, toggle, pending } = useFavoriteToggle(restaurant)

  return (
    <div className="flex items-start gap-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Назад"
        className="shrink-0 w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#0C0310] hover:bg-[#F0F0F0]"
      >
        <ArrowLeftIcon />
      </button>

      <div className="flex-1 min-w-0 rounded-2xl bg-[#FAFAFA] p-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-[#0C0310] truncate">
            {name}
          </h1>
          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            aria-label={
              isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'
            }
            aria-pressed={isFavorite}
            className="shrink-0 text-[#FF7700] disabled:opacity-60"
          >
            <BookmarkIcon filled={isFavorite} />
          </button>
        </div>

        {categories.length > 0 && (
          <div className="mt-1 text-xs text-[#8C8C8C] truncate">
            {categories.map((c) => c.name).join(' / ')}
          </div>
        )}

        <div className="mt-2 flex items-center gap-4 text-sm text-[#3C3C3C]">
          <span className="flex items-center gap-1">
            <StarIcon />
            <span>
              {rating}
              {review_count != null && (
                <span className="text-[#8C8C8C]">({review_count})</span>
              )}
            </span>
          </span>
          {prep && (
            <span className="flex items-center gap-1">
              <ClockIcon />
              <span>{prep}</span>
            </span>
          )}
        </div>

        {pickup_address && (
          <div className="mt-1 flex items-center gap-1 text-sm text-[#3C3C3C]">
            <PinIcon />
            <span className="truncate">{pickup_address}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function formatPrepTime(
  min: number | null,
  max: number | null,
): string | null {
  if (min == null && max == null) return null
  if (min != null && max != null) return `${min}–${max} мин`
  return `${min ?? max} мин`
}

function HeaderSkeleton() {
  return (
    <div className="flex items-start gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-[#E5E5E5]" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-1/3 bg-[#E5E5E5] rounded" />
        <div className="h-3 w-1/4 bg-[#E5E5E5] rounded" />
        <div className="h-4 w-1/2 bg-[#E5E5E5] rounded" />
      </div>
    </div>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5 15.09 8.77 22 9.77l-5 4.87 1.18 6.88L12 18.27l-6.18 3.25L7 14.64l-5-4.87 6.91-1Z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="17" height="23" viewBox="0 0 17 23" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {filled ? (
        <path d="M0 1.22634L1.21429 0H15.7857L17 1.22634V23L8.5 17.913L0 23V1.22634Z" fill="currentColor" />
      ) : (
        <path fillRule="evenodd" clipRule="evenodd" d="M0 1.22634L1.21429 0H15.7857L17 1.22634V23L8.5 17.913L0 23V1.22634ZM2.42857 2.45269V18.6957L8.5 15.062L14.5714 18.6957V2.45269H2.42857Z" fill="currentColor" />
      )}
    </svg>
  )
}
