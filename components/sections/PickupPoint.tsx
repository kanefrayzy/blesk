import { PendingBadge } from '@/components/ui/PendingBadge'
import { IconArrow } from '@/components/ui/Icons'
import { org, pending } from '@/lib/content'

export function PickupPoint() {
  return (
    <div className="grid gap-6 rounded-xl bg-white px-7 py-8 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
      <div>
        <h3 className="h2 text-[1.0625rem] text-navy">Наш приёмный пункт</h3>
        <p className="mt-4 text-[0.875rem] leading-snug text-navy">
          {org.region},<br />
          г.&nbsp;{org.city}, {org.street}
        </p>
        <p className="mt-4 text-[0.75rem] leading-relaxed text-slate-soft">
          <PendingBadge>Уточнить</PendingBadge>
          {pending.house}, {pending.hours}
        </p>
        <a
          href={org.routeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-teal"
        >
          Проложить маршрут
          <IconArrow className="h-4 w-4" />
        </a>
      </div>

      {/* Виджет ищет улицу: номер дома не подтверждён, ставить наугад нельзя */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-line bg-mist">
        <iframe
          src={org.mapEmbedUrl}
          title={`Карта: ${org.region}, г. ${org.city}, ${org.street}`}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  )
}
