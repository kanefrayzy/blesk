import { PostSkeleton } from '@/components/blog/PostSkeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { Container } from '@/components/ui/Container'

/**
 * Показывается, только пока страница действительно собирается: список
 * статический, поэтому обычно читатель сюда не попадает. Заглушка нужна
 * первому посетителю после публикации, когда Next пересобирает раздел.
 */
export default function Loading() {
  return (
    <>
      <PageHeader />

      <main>
        <section className="bg-navy">
          <Container className="pt-12 pb-16 lg:pt-16 lg:pb-20">
            <p className="label text-teal">Блеск</p>
            <h1 className="h1 mt-4 max-w-[18ch] text-[clamp(2rem,4.4vw,3.25rem)] text-white">
              Новости и статьи
            </h1>
            <div className="mt-8 h-3 w-full max-w-[38rem] animate-pulse rounded-full bg-white/10" />
            <div className="mt-2.5 h-3 w-full max-w-[30rem] animate-pulse rounded-full bg-white/10" />
          </Container>
        </section>

        <section className="bg-cream">
          <Container className="py-12 lg:py-16">
            <PostSkeleton wide />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </div>
          </Container>
        </section>
      </main>
    </>
  )
}
