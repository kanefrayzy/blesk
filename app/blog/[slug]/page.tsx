import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostCard } from '@/components/blog/PostCard'
import { PostCover } from '@/components/blog/PostCover'
import { PageHeader } from '@/components/layout/PageHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SkipLink } from '@/components/layout/SkipLink'
import { Container } from '@/components/ui/Container'
import { IconArrow } from '@/components/ui/Icons'
import { formatDate, getPost, getPosts, minutesLabel } from '@/lib/blog'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  const description = post.seo_description ?? post.excerpt
  const url = `${SITE_URL}/blog/${post.slug}`

  return {
    title: post.seo_title ?? post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      url,
      title: post.seo_title ?? post.title,
      description,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      images: post.cover_url ? [{ url: post.cover_url }] : undefined,
    },
  }
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const others = (await getPosts()).filter((p) => p.slug !== post.slug).slice(0, 3)

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${SITE_URL}/blog/${post.slug}#article`,
        headline: post.title,
        description: post.seo_description ?? post.excerpt,
        inLanguage: 'ru-RU',
        datePublished: post.published_at,
        dateModified: post.updated_at ?? post.published_at,
        image: post.cover_url ?? undefined,
        mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        author: { '@id': `${SITE_URL}/#business` },
        publisher: { '@id': `${SITE_URL}/#business` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Новости и статьи', item: `${SITE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
      />

      <SkipLink href="#main" />
      <PageHeader />

      <main id="main">
        <section className="bg-navy">
          <Container className="pt-10 pb-14 lg:pt-14 lg:pb-16">
            <nav aria-label="Хлебные крошки" className="text-[0.75rem] text-white/50">
              <Link href="/blog" className="transition-colors hover:text-teal">
                Новости и статьи
              </Link>
            </nav>

            <h1 className="h2 mt-5 max-w-[24ch] text-[clamp(1.75rem,3.6vw,2.75rem)] text-white">
              {post.title}
            </h1>

            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8125rem] text-white/55">
              {post.published_at && (
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              )}
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/30" />
              <span>{minutesLabel(post.reading_minutes)} чтения</span>
            </p>
          </Container>
        </section>

        <section className="bg-white">
          <Container className="py-12 lg:py-16">
            <div className="mx-auto max-w-[46rem]">
              {/* Без обложки фирменная плашка здесь только заняла бы экран:
                  тёмная шапка выше уже даёт материалу картинку. */}
              {post.cover_url && (
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-mist">
                  <PostCover
                    url={post.cover_url}
                    alt={post.cover_alt}
                              sizes="(min-width: 1024px) 46rem, 92vw"
                    priority
                  />
                </div>
              )}

              <p
                className={`text-[1.0625rem] leading-relaxed font-medium text-navy ${post.cover_url ? 'mt-10' : ''}`}
              >
                {post.excerpt}
              </p>

              {/* Разметку пишет редактор в панели — источник доверенный. */}
              <div
                className="article mt-8"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />

              <Link
                href="/blog"
                className="mt-12 inline-flex items-center gap-2 text-[0.8125rem] font-semibold text-teal"
              >
                <IconArrow className="h-4 w-4 rotate-180" />
                Все материалы
              </Link>
            </div>
          </Container>
        </section>

        {others.length > 0 && (
          <section className="bg-cream">
            <Container className="py-14 lg:py-16">
              <h2 className="h2 text-[1.25rem] text-navy">Читайте также</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((other) => (
                  <PostCard key={other.slug} post={other} />
                ))}
              </div>
            </Container>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  )
}
