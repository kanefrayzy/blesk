import { org, services } from '@/lib/content'

export const SITE_URL = 'https://bleskvip.ru'

export const SITE_NAME = 'Химчистка «Блеск»'

export const SITE_TITLE = 'Химчистка в Жуковском — «Блеск», собственное производство'

export const SITE_DESCRIPTION =
  'Профессиональная химчистка в Жуковском на ул. Энергетической: собственный цех 100+ м², ' +
  'итальянское оборудование, опыт сотрудников 20+ лет. Одежда, шубы и кожа, текстиль.'

export const OG_IMAGE = `${SITE_URL}/og.jpg`

/**
 * Разметка организации для поиска.
 *
 * Здесь только подтверждённое. Сознательно отсутствуют: openingHoursSpecification
 * (часы известны, а дни недели — нет, и указывать их наугад нельзя), priceRange
 * (прайса нет), aggregateRating и review — отзывы на сайте пока демонстрационные,
 * а разметка выдуманных оценок это уже поисковый спам.
 */
export const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'ru-RU',
      publisher: { '@id': `${SITE_URL}/#business` },
    },
    {
      '@type': 'DryCleaningOrLaundry',
      '@id': `${SITE_URL}/#business`,
      name: SITE_NAME,
      alternateName: 'Блеск',
      slogan: 'Чистота, которой можно доверять',
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/logo-h-navy.svg`,
      image: OG_IMAGE,
      telephone: org.phones.map((p) => p.display),
      email: org.email,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'RU',
        addressRegion: org.region,
        addressLocality: org.city,
        streetAddress: org.street,
      },
      areaServed: { '@type': 'City', name: org.city },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Услуги химчистки «Блеск»',
        itemListElement: services.map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.name, description: s.note },
        })),
      },
    },
  ],
}
