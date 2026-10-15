import type { Metadata } from 'next'
import { DealerClose } from '@/components/dealer/DealerClose'
import { DealerIntro } from '@/components/dealer/DealerIntro'
import { DealerLoop } from '@/components/dealer/DealerLoop'
import { DealerMarket } from '@/components/dealer/DealerMarket'
import { DealerSplit } from '@/components/dealer/DealerSplit'
import { CurveHero } from '@/components/layout/CurveHero'
import { PageHeader } from '@/components/layout/PageHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SkipLink } from '@/components/layout/SkipLink'
import { PhotoMosaic } from '@/components/sections/PhotoMosaic'
import { ghostButton, ServiceButton } from '@/components/service/ServiceButton'
import { getContent } from '@/lib/cms'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { dealerPage } = await getContent()

  return {
    title: dealerPage.seoTitle,
    description: dealerPage.seoDescription,
    alternates: { canonical: '/dileram' },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/dileram`,
      title: dealerPage.seoTitle,
      description: dealerPage.seoDescription,
    },
  }
}

export default async function DealerPage() {
  const { dealerPage, production, services } = await getContent()

  const shots = production.map((p) => ({ key: p.key, name: p.name, src: p.photo, alt: p.name }))

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
        <CurveHero
          titleLines={dealerPage.titleLines}
          accentLines={dealerPage.accentLines}
          lead={dealerPage.lead}
          photo={dealerPage.photo}
        >
          <ServiceButton href="#zayavka">{dealerPage.cta}</ServiceButton>
          <a href="#kak" className={ghostButton}>
            Как это работает
          </a>
        </CurveHero>
        <DealerIntro page={dealerPage} />
        <DealerLoop page={dealerPage} />
        <DealerSplit page={dealerPage} />
        <DealerMarket page={dealerPage} services={services} />
        <PhotoMosaic title={dealerPage.production.title} text={dealerPage.production.text} shots={shots} />
        <DealerClose page={dealerPage} />
      </main>

      <SiteFooter />
    </>
  )
}
