import { Link } from 'react-router-dom'
import type { RestaurantPublic } from '../types/restaurant'
import { useFavoriteToggle } from '../hooks/useFavoriteToggle'

interface Props {
  restaurant: RestaurantPublic
}

// Star icon — fills #FF7700 per figma accent, outline for empty state
function StarIcon() {
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
      <path d="M12 2.5 15.09 8.77 22 9.77l-5 4.87 1.18 6.88L12 18.27l-6.18 3.25L7 14.64l-5-4.87 6.91-1Z" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  )
}

export default function RestaurantCard({ restaurant }: Props) {
  const { id, name, photo_url, average_rating } = restaurant
  const rating = average_rating?.toFixed(1).replace('.', ',') ?? '—'

  const { isFavorite, toggle, pending } = useFavoriteToggle(restaurant)

  const onHeartClick = (e: React.MouseEvent) => {
    // Heart sits inside <Link> — stop the card-wide navigation.
    e.preventDefault()
    e.stopPropagation()
    toggle()
  }

  return (
    <Link
      to={`/restaurants/${id}`}
      className="group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7700]/60 rounded-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#D9D9D9]">
        {photo_url && (
          <img
            src={photo_url}
            alt={name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <button
          type="button"
          onClick={onHeartClick}
          disabled={pending}
          aria-label={
            isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'
          }
          aria-pressed={isFavorite}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#FF7700] hover:bg-white disabled:opacity-60 transition-colors"
        >
          <HeartIcon filled={isFavorite} />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-[#0C0310] truncate">{name}</span>
        <span className="flex items-center gap-1 text-sm text-[#3C3C3C] shrink-0">
          <span className="text-[#3C3C3C]">
            <StarIcon />
          </span>
          <span>{rating}</span>
        </span>
      </div>
    </Link>
  )
}
