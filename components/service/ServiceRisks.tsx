import { BrandIcon } from '@/components/ui/BrandIcon'
import { Container } from '@/components/ui/Container'
import type { CmsService } from '@/lib/cmsTypes'

/** Чем рискует вещь: тёмная панель с выводом и карточки рисков с иконками брендбука. */
export function ServiceRisks({ page }: { page: CmsService }) {
  const { title, punch, items } = page.risk

  return (
    <section className="bg-white">
      <Container className="grid gap-5 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
        <div className="relative flex min-h-[18rem] flex-col overflow-hidden rounded-3xl bg-navy p-8 lg:p-10">
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 h-64 w-64 rounded-full border-[52px] border-teal/10"
          />
          <h2 className="h2 relative max-w-[12ch] text-[clamp(1.75rem,3.2vw,2.75rem)] text-white">
            {title}
          </h2>
          <p className="relative mt-auto max-w-[30ch] pt-10 font-display text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-snug font-medium text-white/85">
            {punch}
          </p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2">
          {items.map((r) => (
            <li
              key={r.name}
              className="flex flex-col rounded-3xl bg-cream p-6 sm:last:odd:col-span-2 lg:p-7"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(14,26,53,0.08)]">
                <BrandIcon name={r.icon} className="h-8 w-8" />
              </span>
              <h3 className="mt-6 font-display text-[1.1875rem] leading-snug font-bold text-navy">
                {r.name}
              </h3>
              <p className="mt-1.5 text-[1rem] leading-snug text-slate">{r.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
