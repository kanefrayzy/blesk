import type { Metadata } from 'next'
import { DealerClose } from '@/components/dealer/DealerClose'
import { DealerHero } from '@/components/dealer/DealerHero'
import { DealerLoop } from '@/components/dealer/DealerLoop'
import { DealerProduction } from '@/components/dealer/DealerProduction'
import { DealerSplit } from '@/components/dealer/DealerSplit'
import { PageHeader } from '@/components/layout/PageHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SkipLink } from '@/components/layout/SkipLink'
import { production } from '@/lib/content'
import { dealerPage } from '@/lib/dealerPage'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { getSiteMedia } from '@/lib/siteMedia'
import { resolvePhoto } from '@/lib/siteMediaTypes'

const url = `${SITE_URL}/${dealerPage.slug}`

export const metadata: Metadata = {
  title: dealerPage.seoTitle,
  description: dealerPage.seoDescription,
  alternates: { canonical: `/${dealerPage.slug}` },
  openGraph: {
    type: 'website',
    url,
    title: dealerPage.seoTitle,
    description: dealerPage.seoDescription,
  },
}

export default async function DealerPage() {
  const media = await getSiteMedia()

  const shots = production.map((p) => ({
    key: p.key,
    name: p.name,
    ...resolvePhoto(media, `production.${p.key}`, { src: p.photo, alt: p.name }),
  }))

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Дилерам' },
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
        <DealerHero />
        <DealerLoop />
        <DealerSplit />
        <DealerProduction shots={shots} />
        <DealerClose />
      </main>

      <SiteFooter />
    </>
  )
}
