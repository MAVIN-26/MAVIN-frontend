import { useState } from 'react'

interface Props {
  value: number
  readOnly?: boolean
  disabled?: boolean
  onChange?: (value: number) => void
  size?: number
}

export default function StarRating({
  value,
  readOnly = false,
  disabled = false,
  onChange,
  size = 24,
}: Props) {
  const [hover, setHover] = useState(0)
  const display = hover || value
  const interactive = !readOnly && !disabled

  return (
    <div
      className="inline-flex items-center gap-1"
      role="radiogroup"
      aria-label="Оценка заказа"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= display
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} из 5`}
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.(n)}
            className={
              'leading-none ' +
              (interactive ? 'cursor-pointer' : 'cursor-default')
            }
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={filled ? '#FF7700' : 'none'}
              stroke={filled ? '#FF7700' : '#C2C2C2'}
              strokeWidth="1.6"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 3.5l2.7 5.5 6.1.9-4.4 4.3 1 6L12 17.4l-5.4 2.8 1-6L3.2 9.9l6.1-.9z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
