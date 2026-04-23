import Modal from './Modal'
import { useCartStore } from '../store/cartStore'

/**
 * Global modal shown when POST /cart/items returns 409 (pending item from
 * another restaurant). Driven by cartStore.conflict.
 */
export default function CartConflictModal() {
  const conflict = useCartStore((s) => s.conflict)
  const resolve = useCartStore((s) => s.resolveConflict)
  const dismiss = useCartStore((s) => s.dismissConflict)

  return (
    <Modal
      open={conflict !== null}
      title="Очистить корзину?"
      onClose={dismiss}
      maxWidth="sm"
    >
      <p className="text-sm text-[#3C3C3C]">
        В корзине уже есть блюда из другого ресторана. Очистить корзину и
        добавить это блюдо?
      </p>
      <div className="flex justify-end gap-2 mt-5">
        <button
          type="button"
          onClick={dismiss}
          className="px-4 h-10 rounded-xl text-sm text-[#3C3C3C] hover:bg-[#F0F0F0]"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={() => resolve()}
          className="px-4 h-10 rounded-xl bg-[#FF7700] text-white text-sm font-medium hover:bg-[#E56B00]"
        >
          Очистить и добавить
        </button>
      </div>
    </Modal>
  )
}
