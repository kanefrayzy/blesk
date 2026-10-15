import type { dealerPage } from '@/lib/dealerPage'
import type { vacanciesPage } from '@/lib/vacanciesPage'

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: Widen<T[K]> }
      : T

export type CmsService = {
  slug: string
  name: string
  note: string
  icon: string
  cardPhoto: string
  heroPhoto: string
  heroAlt: string
  processPhoto: string
  processName: string
  processNote: string
  title: string
  lead: string
  price: string | null
  priceNote: string
  risk: { title: string; punch: string; items: { name: string; text: string; icon: string }[] }
  factors: string[]
  steps: { name: string; text: string }[]
  result: string
  prices: { item: string; price: string }[]
  priceText: string
  cta: string
  form: 'order' | 'business'
  seoTitle: string
  seoDescription: string
}

export type CmsHeroSlide = {
  key: string
  label: string
  title: string[]
  accent: string[]
  note: string
  photo: string
  photoMobile: string
  alt: string
  href: string
}

export type CmsProductionSlide = { key: string; name: string; note: string; photo: string }

export type CmsVacancy = {
  key: string
  title: string
  summary: string
  photo: string
  focus: string
  duties: string[]
  requirements: string[]
}

export type DealerPageContent = Widen<typeof dealerPage>

export type VacanciesPageContent = Widen<typeof vacanciesPage>

export type SiteContent = {
  services: CmsService[]
  heroSlides: CmsHeroSlide[]
  production: CmsProductionSlide[]
  vacancies: CmsVacancy[]
  dealerPage: DealerPageContent
  vacanciesPage: VacanciesPageContent
}
