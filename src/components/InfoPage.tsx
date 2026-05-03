import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
}

export default function InfoPage({ title, children }: Props) {
  return (
    <article className="max-w-[820px] mx-auto flex flex-col gap-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-[#0C0310]">{title}</h1>
      <div className="flex flex-col gap-5 text-[15px] leading-relaxed text-[#0C0310]">
        {children}
      </div>
    </article>
  )
}

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-[#0C0310]">{title}</h2>
      <div className="flex flex-col gap-2 text-[15px] text-[#3A3A3A]">{children}</div>
    </section>
  )
}
