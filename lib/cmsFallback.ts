import type { SiteContent } from '@/lib/cmsTypes'
import { heroSlides, production, services } from '@/lib/content'
import { dealerPage } from '@/lib/dealerPage'
import { priceFactors, servicePages } from '@/lib/servicePages'
import { vacancies, vacanciesPage } from '@/lib/vacanciesPage'

/** Контент на случай, когда бэкенд не ответил: то, что было зашито в витрину. */
export const fallbackContent: SiteContent = JSON.parse(
  JSON.stringify({
    services: servicePages.map((p) => {
      const card = services.find((s) => s.key === p.key)!
      const slide = heroSlides.find((s) => s.key === p.key)!
      const shop = production.find((s) => s.key === p.processPhoto)!
      return {
        slug: p.slug,
        name: card.name,
        note: card.note,
        icon: card.icon,
        cardPhoto: card.photo,
        heroPhoto: `/photo/usl-${p.key}.jpg`,
        heroAlt: slide.alt,
        processPhoto: `/photo/usl-${p.key}-ceh.jpg`,
        processName: shop.name,
        processNote: shop.note,
        title: p.title,
        lead: p.lead,
        price: p.price,
        priceNote: p.priceNote,
        risk: p.risk,
        factors: p.factors ?? priceFactors,
        steps: p.steps,
        result: p.result,
        prices: p.prices,
        priceText: p.priceText,
        cta: p.cta,
        form: p.key === 'korp' ? 'business' : 'order',
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
      }
    }),
    heroSlides: heroSlides.map((s) => ({ ...s, href: '' })),
    production,
    vacancies,
    dealerPage,
    vacanciesPage,
  }),
)
