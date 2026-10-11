import Image from 'next/image'
import Link from 'next/link'
import type { Service } from '@/lib/content'
import { servicePath } from '@/lib/servicePages'

type Props = {
  service: Service
  photo: { src: string; alt: string }
  sizes: string
}

/** Карточка услуги: одна на ленту главной и на «Другие услуги». */
export function ServiceCard({ service, photo, sizes }: Props) {
  return (
    <Link
      href={servicePath(service.key)}
      className="group block rounded-xl text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
    >
      <div className="relative">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-mist">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </div>
        {/* Иконка брендбука в своих цветах, поэтому подложка светлая */}
        <span className="absolute -bottom-6 left-1/2 flex h-13 w-13 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(14,26,53,0.14)] ring-4 ring-white">
          <Image
            src={`/icons/${service.icon}`}
            alt=""
            aria-hidden="true"
            width={64}
            height={64}
            className="h-7 w-7"
          />
        </span>
      </div>
      {/* Две строки заголовку выделены всегда: иначе у «Корпоративного
          обслуживания» подпись съезжает и ряд идёт лесенкой. */}
      <h3 className="mt-10 min-h-[2.75rem] font-display text-[1rem] leading-snug font-bold text-navy transition-colors group-hover:text-teal">
        {service.name}
      </h3>
      <p className="mx-auto mt-2 max-w-[26ch] text-[0.8125rem] leading-snug text-slate">
        {service.note}
      </p>
    </Link>
  )
}
