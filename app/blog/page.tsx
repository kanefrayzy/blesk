import type { Metadata } from 'next'
import { FeaturedPost } from '@/components/blog/FeaturedPost'
import { PostCard } from '@/components/blog/PostCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SkipLink } from '@/components/layout/SkipLink'
import { Container } from '@/components/ui/Container'
import { getPosts } from '@/lib/blog'
import { SITE_URL } from '@/lib/seo'

const TITLE = 'Новости и статьи'
const DESCRIPTION =
  'Новости химчистки «Блеск» в Жуковском и статьи об уходе за вещами: материалы, ' +
  'пятна, хранение и то, что можно сделать дома.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/blog' },
  openGraph: {
    url: `${SITE_URL}/blog`,
    title: `${TITLE} — Химчистка «Блеск»`,
    description: DESCRIPTION,
  },
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <>
      <SkipLink href="#main" />
      <PageHeader />

      <main id="main">
        <section className="bg-navy">
          <Container className="pt-12 pb-16 lg:pt-16 lg:pb-20">
            <p className="label rise-in text-teal">Блеск</p>
            <h1
              className="h1 rise-in mt-4 max-w-[18ch] text-[clamp(2rem,4.4vw,3.25rem)] text-white"
              style={{ animationDelay: '60ms' }}
            >
              Новости и статьи
            </h1>
            <p
              className="rise-in mt-6 max-w-[52ch] text-[0.9375rem] leading-relaxed text-white/70"
              style={{ animationDelay: '120ms' }}
            >
              Что происходит в химчистке и что полезно знать о вещах: как их хранить, чем
              выводить пятна и чего не стоит делать дома.
            </p>
          </Container>
        </section>

        <section className="bg-cream">
          <Container className="py-12 lg:py-16">
            {posts.length > 0 ? (
              <>
                {/* Лесенка: карточки проявляются одна за другой, шаг 70 мс.
                    Дальше пятой ждать нечего — они всё равно за экраном. */}
                <div className="rise-in" style={{ animationDelay: '180ms' }}>
                  <FeaturedPost post={posts[0]} />
                </div>

                {posts.length > 1 && (
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.slice(1).map((post, i) => (
                      <div
                        key={post.slug}
                        className="rise-in h-full"
                        style={{ animationDelay: `${250 + Math.min(i, 4) * 70}ms` }}
                      >
                        <PostCard post={post} priority={i < 2} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="rounded-2xl bg-white px-7 py-12 text-center text-[0.9375rem] text-slate">
                Здесь пока пусто. Первые материалы появятся совсем скоро.
              </p>
            )}
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
