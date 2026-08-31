import { PageHeader } from '@/components/layout/PageHeader'
import { Container } from '@/components/ui/Container'

/** Заглушка статьи: тёмная шапка на месте, текст набегает полосами. */
export default function Loading() {
  return (
    <>
      <PageHeader />

      <main>
        <section className="bg-navy">
          <Container className="pt-10 pb-14 lg:pt-14 lg:pb-16">
            <p className="text-[0.75rem] text-white/50">Новости и статьи</p>
            <div className="mt-6 h-7 w-full max-w-[32rem] animate-pulse rounded-full bg-white/10" />
            <div className="mt-3 h-7 w-full max-w-[22rem] animate-pulse rounded-full bg-white/10" />
            <div className="mt-7 h-3 w-48 animate-pulse rounded-full bg-white/10" />
          </Container>
        </section>

        <section className="bg-white">
          <Container className="py-12 lg:py-16">
            <div className="mx-auto max-w-[46rem]" aria-hidden="true">
              <div className="aspect-[16/9] animate-pulse rounded-2xl bg-mist" />
              <div className="mt-10 space-y-4">
                {['w-full', 'w-11/12', 'w-full', 'w-4/5', 'w-full', 'w-10/12', 'w-3/5'].map(
                  (width, i) => (
                    <div
                      key={i}
                      className={`h-3 animate-pulse rounded-full bg-mist ${width}`}
                    />
                  ),
                )}
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  )
}
