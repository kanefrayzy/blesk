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
import { heroSlides, org, production, services } from '@/lib/content'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { servicePages } from '@/lib/servicePages'
import { getSiteMedia } from '@/lib/siteMedia'
import { resolvePhoto } from '@/lib/siteMediaTypes'

type Params = { params: Promise<{ slug: string }> }


export function generateStaticParams() {
  return servicePages.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const page = servicePages.find((p) => p.slug === slug)
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
      images: [{ url: `${SITE_URL}/photo/hero-${page.key}.jpg` }],
    },
  }
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params
  const page = servicePages.find((p) => p.slug === slug)
  if (!page) notFound()

  const service = services.find((s) => s.key === page.key)!
  const slide = heroSlides.find((s) => s.key === page.key)!
  const shop = production.find((p) => p.key === page.processPhoto)!
  const media = await getSiteMedia()

  const photo = resolvePhoto(media, `hero.${page.key}`, { src: `/photo/usl-${page.key}.jpg`, alt: slide.alt })
  const shopPhoto = resolvePhoto(media, `production.${shop.key}`, { src: `/photo/usl-${page.key}-ceh.jpg`, alt: shop.name })

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${SITE_URL}/uslugi/${page.slug}#service`,
        name: page.title,
        description: page.seoDescription,
        serviceType: service.name,
        url: `${SITE_URL}/uslugi/${page.slug}`,
        provider: { '@id': `${SITE_URL}/#business` },
        areaServed: { '@type': 'City', name: org.city },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Услуги', item: `${SITE_URL}/#uslugi` },
          { '@type': 'ListItem', position: 3, name: service.name },
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
        <ServiceHero page={page} service={service} photo={photo} />
        <ServicePrices page={page} />
        <ServiceRisks page={page} />
        <ServiceProcess page={page} shop={{ ...shopPhoto, name: shop.name, note: shop.note }} />
        <ServiceCta business={page.key === 'korp'} />
        <OtherServices current={page.key} media={media} />
        {page.key === 'korp' ? <BusinessRequest /> : <OnlineOrder />}
      </main>

      <SiteFooter />
    </>
  )
}
