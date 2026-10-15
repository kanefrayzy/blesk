import { Container } from '@/components/ui/Container'
import type { DealerPageContent } from '@/lib/cmsTypes'

export function DealerIntro({ page }: { page: DealerPageContent }) {
  const { intro } = page

  return (
    <section className="bg-white">
      <Container className="grid gap-8 py-14 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-20">
        <h2 className="h2 max-w-[18ch] text-[clamp(1.75rem,3.2vw,2.75rem)] text-balance text-navy">
          {intro.title}
        </h2>
        <div className="space-y-4 text-[1.0625rem] leading-relaxed text-slate">
          {intro.text.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </Container>
    </section>
  )
}
