import { TrackedPhoneLink } from '@/components/metrics/TrackedPhoneLink'
import { Container } from '@/components/ui/Container'
import { VacancyForm } from '@/components/vacancy/VacancyForm'
import { org } from '@/lib/content'
import type { CmsVacancy, VacanciesPageContent } from '@/lib/cmsTypes'

export function VacancyClose({ page, vacancies }: { page: VacanciesPageContent; vacancies: CmsVacancy[] }) {
  const { reply } = page

  return (
    <section id="otklik" className="scroll-mt-20 bg-cream">
      <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-24">
        <div className="lg:pt-6">
          <h2 className="h2 max-w-[14ch] text-[clamp(1.875rem,3.6vw,3rem)] text-balance text-navy">
            {reply.title}
          </h2>
          <p className="mt-6 max-w-[40ch] text-[1.0625rem] leading-relaxed text-slate">{reply.text}</p>

          <dl className="mt-10 space-y-6">
            <div>
              <dt className="text-[0.875rem] text-slate">Позвонить</dt>
              <dd className="mt-1">
                <TrackedPhoneLink
                  href={org.phones[0].href}
                  className="font-display text-[1.375rem] font-bold text-navy tabular-nums transition-colors hover:text-teal"
                >
                  {org.phones[0].display}
                </TrackedPhoneLink>
              </dd>
            </div>
            <div>
              <dt className="text-[0.875rem] text-slate">Адрес</dt>
              <dd className="mt-1 font-display text-[1.125rem] font-bold text-navy">
                г.&nbsp;{org.city}, {org.street}
              </dd>
            </div>
          </dl>
        </div>

        <div className="self-start rounded-[1.5rem] bg-white shadow-[0_20px_60px_rgba(14,26,53,0.1)] ring-1 ring-navy/5">
          <VacancyForm vacancies={vacancies} />
        </div>
      </Container>
    </section>
  )
}
