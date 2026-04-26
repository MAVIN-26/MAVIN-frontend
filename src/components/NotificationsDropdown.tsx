import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '../store/notificationStore'

const formatTime = (ts: number) => {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mi}`
}

export default function NotificationsDropdown() {
  const navigate = useNavigate()
  const items = useNotificationStore((s) => s.items)
  const markAllRead = useNotificationStore((s) => s.markAllRead)

  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const unread = items.filter((it) => !it.read).length

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleToggle = () => {
    setOpen((v) => {
      const next = !v
      if (next && unread > 0) markAllRead()
      return next
    })
  }

  const handleSelect = (orderId: number) => {
    setOpen(false)
    navigate(`/orders?order=${orderId}`)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex items-center justify-center text-black hover:opacity-70 transition-opacity"
        aria-label="Уведомления"
      >
        <svg
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.2678 33.5458C13.9789 33.2793 14.7714 33.6398 15.0379 34.3508C16.0299 36.9976 18.7424 38.9584 22.0004 38.9584C22.3837 38.9584 22.7591 38.9312 23.1244 38.8791C23.8762 38.7717 24.5727 39.2941 24.6801 40.0458C24.7875 40.7976 24.2651 41.4941 23.5134 41.6014C23.0189 41.6721 22.5135 41.7084 22.0004 41.7084C17.6407 41.7084 13.8727 39.0777 12.4628 35.3159C12.1963 34.6048 12.5567 33.8123 13.2678 33.5458ZM28.9629 34.3508C29.2294 33.6397 30.0219 33.2794 30.733 33.5459C31.4441 33.8124 31.8044 34.6049 31.5379 35.316C30.9626 36.8508 29.9935 38.1973 28.7563 39.2519C28.1783 39.7445 27.3105 39.6753 26.8179 39.0974C26.3253 38.5195 26.3944 37.6516 26.9724 37.159C27.8709 36.3931 28.5588 35.4289 28.9629 34.3508Z"
            fill="#000"
          />
          <path
            d="M8.25164 17.8007V16.509C8.25164 14.339 8.72255 12.2779 9.56713 10.4326C9.88318 9.74215 10.6992 9.43861 11.3896 9.75464C12.0801 10.0707 12.3837 10.8867 12.0677 11.5772C11.3852 13.0683 11.0016 14.7395 11.0016 16.509V17.8007C11.0016 19.6114 10.4855 21.3853 9.51293 22.8995L7.48261 26.0604C6.10065 28.2119 7.19614 31.0704 9.48683 31.7188C17.6797 34.038 26.3204 34.038 34.5131 31.7188C36.804 31.0704 37.8994 28.2119 36.5174 26.0604L34.4872 22.8995C33.5146 21.3853 32.9984 19.6114 32.9984 17.8007V16.509C32.9984 10.127 28.0264 5.0415 22 5.0415C20.3192 5.0415 18.7286 5.43375 17.3051 6.13565C16.624 6.47148 15.7996 6.1916 15.4638 5.51051C15.128 4.82942 15.4078 4.00502 16.0889 3.66919C17.8799 2.7861 19.8855 2.2915 22 2.2915C29.6408 2.2915 35.7484 8.70554 35.7484 16.509V17.8007C35.7484 19.0906 36.1165 20.3476 36.8009 21.4133L38.8312 24.5741L38.885 24.6593C41.1134 28.2462 39.4171 33.119 35.3592 34.3365L35.2621 34.3648C26.5797 36.8226 17.4204 36.8226 8.73783 34.3648C4.57775 33.1872 2.84178 28.1969 5.16879 24.5741L7.19907 21.4133C7.88352 20.3477 8.25164 19.0907 8.25164 17.8007Z"
            fill="#000"
          />
        </svg>
        {unread > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-[#FF7700] text-white text-[10px] font-semibold flex items-center justify-center px-1"
            aria-label={`${unread} непрочитанных`}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-[320px] max-h-[420px] overflow-y-auto rounded-2xl bg-white shadow-xl border border-[#E5E5E5] z-50"
        >
          <header className="px-4 py-3 border-b border-[#E5E5E5]">
            <h3 className="text-sm font-semibold text-[#0C0310]">
              Уведомления
            </h3>
          </header>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[#8C8C8C] text-center">
              Пока нет уведомлений
            </p>
          ) : (
            <ul className="flex flex-col">
              {items.map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(it.order_id)}
                    className="w-full text-left px-4 py-3 hover:bg-[#F5F5F5] border-b border-[#F0F0F0] last:border-b-0"
                  >
                    <div className="text-sm text-[#0C0310]">{it.message}</div>
                    <div className="text-xs text-[#8C8C8C] mt-1">
                      Заказ #{it.order_id} · {formatTime(it.created_at)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
