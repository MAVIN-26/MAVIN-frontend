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

export default function RestaurantCard({ restaurant }: Props) {
  const { id, name, photo_url, average_rating } = restaurant
  const rating = average_rating?.toFixed(1).replace('.', ',') ?? '—'

  const { isFavorite, toggle, pending } = useFavoriteToggle(restaurant)

  const onBookmarkClick = (e: React.MouseEvent) => {
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
          onClick={onBookmarkClick}
          disabled={pending}
          aria-label={
            isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'
          }
          aria-pressed={isFavorite}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#FF7700] hover:bg-white disabled:opacity-60 transition-colors"
        >
          <BookmarkIcon filled={isFavorite} />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-black truncate">{name}</span>
        <span className="flex items-center gap-1 text-sm text-black shrink-0">
          <StarIcon />
          <span>{rating}</span>
        </span>
      </div>
    </Link>
  )
}
