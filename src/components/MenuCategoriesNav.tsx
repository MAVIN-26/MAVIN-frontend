import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { MenuCategory } from '../types/menuCategory'

interface Props {
  categories: MenuCategory[]
  hasUserChoice: boolean
  onOpenKbju?: () => void
  onOpenAllergens?: () => void
  kbjuActive?: boolean
  allergensActive?: boolean
  // Slot for filter popovers rendered inside the right chip group so they
  // position relative to the chips via `absolute top-full`.
  kbjuSlot?: ReactNode
  allergensSlot?: ReactNode
}

// Section DOM ids matching those rendered on RestaurantPage.
const ALL_ID = 'menu-all'
const USER_CHOICE_ID = 'menu-user-choice'
const categoryId = (id: number) => `menu-category-${id}`

export default function MenuCategoriesNav({
  categories,
  hasUserChoice,
  onOpenKbju,
  onOpenAllergens,
  kbjuActive = false,
  allergensActive = false,
  kbjuSlot,
  allergensSlot,
}: Props) {
  const [activeId, setActiveId] = useState<string>(ALL_ID)
  const navRef = useRef<HTMLDivElement>(null)

  // Collect anchor target ids in render order for intersection tracking.
  const targetIds: string[] = [
    ALL_ID,
    ...(hasUserChoice ? [USER_CHOICE_ID] : []),
    ...categories.map((c) => categoryId(c.id)),
  ]

  useEffect(() => {
    const elements = targetIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible section.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIds.join(',')])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div
      ref={navRef}
      className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-[#FAFAFA] border-b border-[#F0F0F0]"
    >
      <div className="flex items-center gap-2 overflow-x-auto">
        <Chip label="Все" active={activeId === ALL_ID} onClick={() => scrollTo(ALL_ID)} />
        {hasUserChoice && (
          <Chip
            label="Выбор пользователей"
            active={activeId === USER_CHOICE_ID}
            onClick={() => scrollTo(USER_CHOICE_ID)}
          />
        )}
        {categories.map((c) => {
          const id = categoryId(c.id)
          return (
            <Chip
              key={c.id}
              label={c.name}
              active={activeId === id}
              onClick={() => scrollTo(id)}
            />
          )
        })}
        <div className="ml-auto flex gap-2 shrink-0">
          <div className="relative">
            <Chip label="КБЖУ" active={kbjuActive} onClick={onOpenKbju} />
            {kbjuSlot}
          </div>
          <div className="relative">
            <Chip
              label="Аллергены"
              active={allergensActive}
              onClick={onOpenAllergens}
            />
            {allergensSlot}
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={
        'shrink-0 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ' +
        (active
          ? 'bg-[#FF7700] text-white'
          : 'bg-[#FAFAFA] text-[#0C0310] hover:bg-[#F0F0F0] disabled:opacity-60')
      }
    >
      {label}
    </button>
  )
}

export { ALL_ID, USER_CHOICE_ID, categoryId }
