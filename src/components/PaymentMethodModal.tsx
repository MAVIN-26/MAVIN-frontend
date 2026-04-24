import { useState } from 'react'
import Modal from './Modal'

// Соответствует enum payment_method в swagger.json (POST /orders).
export type PaymentMethod = 'card_online' | 'cash_on_receipt'

interface Props {
  open: boolean
  value: PaymentMethod
  onClose: () => void
  onSelect: (method: PaymentMethod) => void
}

interface Option {
  value: PaymentMethod | 'add_card'
  icon: string
  label: string
  disabled?: boolean
}

const OPTIONS: Option[] = [
  { value: 'card_online', icon: '💳', label: 'Карта ****77' },
  { value: 'add_card', icon: '＋', label: 'Добавить карту', disabled: true },
  { value: 'cash_on_receipt', icon: '💵', label: 'Наличные при получении' },
]

export default function PaymentMethodModal({
  open,
  value,
  onClose,
  onSelect,
}: Props) {
  const [draft, setDraft] = useState<PaymentMethod>(value)

  const handleConfirm = () => {
    onSelect(draft)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Способ оплаты" maxWidth="sm">
      <ul className="flex flex-col gap-2">
        {OPTIONS.map((o) => {
          const isSelected = !o.disabled && draft === o.value
          return (
            <li key={o.value}>
              <button
                type="button"
                disabled={o.disabled}
                onClick={() => setDraft(o.value as PaymentMethod)}
                className={
                  'w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-left transition ' +
                  (o.disabled
                    ? 'bg-[#F5F5F5] border-[#E5E5E5] text-[#8C8C8C] cursor-not-allowed'
                    : isSelected
                      ? 'bg-white border-[#FF7700] text-[#0C0310]'
                      : 'bg-white border-[#E5E5E5] text-[#0C0310] hover:bg-[#F5F5F5]')
                }
              >
                <span aria-hidden className="text-base">
                  {o.icon}
                </span>
                <span className="flex-1">{o.label}</span>
                <span
                  className={
                    'w-5 h-5 rounded-full border flex items-center justify-center ' +
                    (isSelected
                      ? 'border-[#FF7700] bg-[#FF7700]'
                      : 'border-[#E5E5E5] bg-white')
                  }
                  aria-hidden
                >
                  {isSelected && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M5 12l5 5L20 7"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={handleConfirm}
        className="mt-5 w-full h-11 rounded-xl bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56B00]"
      >
        Выбрать
      </button>
    </Modal>
  )
}
