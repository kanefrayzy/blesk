import type { Metadata } from 'next'
import { CurveHero } from '@/components/layout/CurveHero'
import { PageHeader } from '@/components/layout/PageHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SkipLink } from '@/components/layout/SkipLink'
import { PhotoMosaic } from '@/components/sections/PhotoMosaic'
import { ghostButton, ServiceButton } from '@/components/service/ServiceButton'
import { VacancyClose } from '@/components/vacancy/VacancyClose'
import { VacancyList } from '@/components/vacancy/VacancyList'
import { VacancyOffers } from '@/components/vacancy/VacancyOffers'
import { org } from '@/lib/content'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { vacancies, vacanciesPage } from '@/lib/vacanciesPage'

const url = `${SITE_URL}/${vacanciesPage.slug}`

/** День, когда заказчик прислал список должностей. */
const DATE_POSTED = '2026-10-13'

export const metadata: Metadata = {
  title: vacanciesPage.seoTitle,
  description: vacanciesPage.seoDescription,
  alternates: { canonical: `/${vacanciesPage.slug}` },
  openGraph: {
    type: 'website',
    url,
    title: vacanciesPage.seoTitle,
    description: vacanciesPage.seoDescription,
  },
}

export default function VacanciesPage() {
  // Зарплаты, графика и типа занятости заказчик не называл — в разметку их не ставим.
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      ...vacancies.map((v) => ({
        '@type': 'JobPosting',
        title: v.title,
        description: `<p>${v.summary}</p><p>Обязанности:</p><ul>${v.duties
          .map((d) => `<li>${d}</li>`)
          .join('')}</ul><p>Требования:</p><ul>${v.requirements.map((r) => `<li>${r}</li>`).join('')}</ul>`,
        datePosted: DATE_POSTED,
        url: `${url}#${vacanciesPage.slug}`,
        hiringOrganization: { '@id': `${SITE_URL}/#business` },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'RU',
            addressRegion: org.region,
            addressLocality: org.city,
            streetAddress: org.street,
          },
        },
      })),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Вакансии' },
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
        <CurveHero
          titleLines={vacanciesPage.titleLines}
          accentLines={vacanciesPage.accentLines}
          lead={vacanciesPage.lead}
          photo={vacanciesPage.heroPhoto}
        >
          <ServiceButton href="#vakansii">Смотреть вакансии</ServiceButton>
          <a href="#otklik" className={ghostButton}>
            Откликнуться
          </a>
        </CurveHero>
        <VacancyOffers />
        <VacancyList />
        <PhotoMosaic
          title={vacanciesPage.place.title}
          text={vacanciesPage.place.text}
          shots={vacanciesPage.place.shots.map((s) => ({ ...s, alt: s.name }))}
        />
        <VacancyClose />
      </main>

      <SiteFooter />
    </>
  )
}
