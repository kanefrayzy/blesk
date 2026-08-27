import { BrandIcon } from '@/components/ui/BrandIcon'

/**
 * На морском поле мобильной раскладки — стеклянная плитка, на десктопе —
 * белая карточка на стыке фигуры и фотографии. Плашка иконки светлая всегда:
 * иконки брендбука нарисованы морским и на тёмном пропадут.
 */
export function ExperienceCard() {
  return (
    <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15 lg:pointer-events-none lg:absolute lg:top-[46.4%] lg:left-[38.8%] lg:z-[3] lg:max-w-[12.1%] lg:rounded-[10px] lg:bg-white lg:p-[1.1vw] lg:shadow-[0_8px_21px_rgba(25,27,37,0.12)] lg:ring-0">
      {/* lg:w-full переносит «лет опыта» на свою строку — так в макете */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 lg:gap-[0.6vw]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white lg:h-[2.5vw] lg:w-[2.5vw] lg:bg-teal/10">
          <BrandIcon name="value-chestnost.svg" className="h-5 w-5 lg:h-[1.4vw] lg:w-[1.4vw]" />
        </span>
        <strong className="font-display text-[1.75rem] leading-none font-bold text-white lg:text-[1.9vw] lg:text-navy">
          15+
        </strong>
        <b className="font-display text-[0.9375rem] leading-none font-semibold text-white/85 lg:mt-[0.55vw] lg:w-full lg:text-[1vw] lg:text-navy">
          лет опыта
        </b>
      </div>
      <small className="mt-3 block text-[0.8125rem] leading-snug text-white/60 lg:mt-[0.7vw] lg:text-[0.72vw] lg:text-slate-soft">
        Профессиональный уход в собственном цехе
      </small>
    </div>
  )
}
