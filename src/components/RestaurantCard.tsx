import { Link } from 'react-router-dom'
import type { RestaurantPublic } from '../types/restaurant'

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

export default function RestaurantCard({ restaurant }: Props) {
  const { id, name, photo_url, average_rating } = restaurant
  const rating = average_rating?.toFixed(1).replace('.', ',') ?? '—'

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
