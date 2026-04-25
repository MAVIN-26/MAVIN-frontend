interface Props {
  size?: number
  label?: string
  className?: string
}

export default function Spinner({ size = 20, label = 'Загрузка…', className = '' }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 text-sm text-[#8C8C8C] ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="#E5E5E5" strokeWidth="3" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="#FF7700"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label && <span>{label}</span>}
    </div>
  )
}
