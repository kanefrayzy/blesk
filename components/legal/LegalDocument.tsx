import { PageHeader } from '@/components/layout/PageHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Container } from '@/components/ui/Container'

export function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-900">
      [{children}]
    </span>
  )
}

export function LegalDocument({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <>
      <PageHeader />
      <main className="bg-cream py-12 sm:py-16">
        <Container className="max-w-[900px]">
          <div className="rounded-2xl bg-white px-5 py-8 shadow-[0_12px_36px_rgba(14,26,53,0.08)] sm:px-10 sm:py-12">
            <p className="label text-teal">Правовая информация</p>
            <h1 className="h2 mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] text-navy">{title}</h1>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-slate">{description}</p>

            <div className="mt-7 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[0.8125rem] leading-relaxed text-amber-950">
              Это рабочий шаблон. До публикации необходимо заменить все поля в квадратных скобках
              и проверить документ у специалиста по персональным данным.
            </div>

            <article className="article mt-10">{children}</article>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}

