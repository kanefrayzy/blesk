import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BusinessRequest } from '@/components/business/BusinessRequest'
import { PageHeader } from '@/components/layout/PageHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SkipLink } from '@/components/layout/SkipLink'
import { OnlineOrder } from '@/components/sections/OnlineOrder'
import { OtherServices } from '@/components/service/OtherServices'
import { ServiceCta } from '@/components/service/ServiceCta'
import { ServiceHero } from '@/components/service/ServiceHero'
import { ServicePrices } from '@/components/service/ServicePrices'
import { ServiceProcess } from '@/components/service/ServiceProcess'
import { ServiceRisks } from '@/components/service/ServiceRisks'
import { getContent } from '@/lib/cms'
import { org } from '@/lib/content'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const { services } = await getContent()
  return services.map((s) => ({ slug: s.slug }))
}

async function findService(slug: string) {
  const { services } = await getContent()
  return { services, page: services.find((s) => s.slug === slug) }
}

const absolute = (src: string) => (src.startsWith('/') ? `${SITE_URL}${src}` : src)

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const { page } = await findService(slug)
  if (!page) return {}

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `/uslugi/${page.slug}` },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/uslugi/${page.slug}`,
      title: page.seoTitle,
      description: page.seoDescription,
      images: [{ url: absolute(page.heroPhoto) }],
    },
  }
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params
  const { services, page } = await findService(slug)
  if (!page) notFound()

  const business = page.form === 'business'

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${SITE_URL}/uslugi/${page.slug}#service`,
        name: page.title,
        description: page.seoDescription,
        serviceType: page.name,
        url: `${SITE_URL}/uslugi/${page.slug}`,
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: { '@type': 'City', name: org.city },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Услуги', item: `${SITE_URL}/#uslugi` },
          { '@type': 'ListItem', position: 3, name: page.name },
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
        <ServiceHero page={page} photo={{ src: page.heroPhoto, alt: page.heroAlt || page.title }} />
        <ServicePrices page={page} />
        {page.risk.items.length > 0 && <ServiceRisks page={page} />}
        {page.steps.length > 0 && (
          <ServiceProcess
            page={page}
            shop={{ src: page.processPhoto, alt: page.processName || page.name, name: page.processName, note: page.processNote }}
          />
        )}
        <ServiceCta business={business} />
        <OtherServices current={page.slug} services={services} />
        {business ? <BusinessRequest /> : <OnlineOrder />}
      </main>

      <SiteFooter />
    </>
  )
}
