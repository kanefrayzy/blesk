'use client'

import { SiteHeader } from '@/components/layout/SiteHeader'
import { IconArrow, IconChevron } from '@/components/ui/Icons'
import { ExperienceCard } from '@/components/hero/ExperienceCard'
import { HeroDots } from '@/components/hero/HeroDots'
import { HeroShapes } from '@/components/hero/HeroShapes'
import { HeroSlides } from '@/components/hero/HeroSlides'
import { OrderCard } from '@/components/hero/OrderCard'
import { useHeroCarousel } from '@/components/hero/useHeroCarousel'
import { heroSlides } from '@/lib/content'

const CTA =
  'inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full px-5 font-display text-[clamp(0.6875rem,0.89vw,0.9375rem)] font-extrabold tracking-wide uppercase transition-[background-color,border-color,transform,box-shadow] duration-200 active:scale-[0.97] lg:h-[3.7vw] lg:px-[calc(2vw_-_7px)]'

export function Hero() {
  const c = useHeroCarousel()
  const slide = heroSlides[c.active]

  return (
    <div className="relative">
      <SiteHeader />

      <section
        ref={c.section}
        id="top"
        aria-roledescription="слайдер"
        aria-label="Услуги «Блеска»"
        className="relative bg-navy lg:aspect-[941/433] lg:overflow-hidden"
      >
        {/* Ниже 1024px первый экран — фотография во весь экран с текстом поверх.
            Фигуры и абсолютная сетка включаются с lg, и там обёртка становится
            static: координаты считаются от секции. */}
        <div className="relative h-[86svh] min-h-[560px] overflow-hidden lg:static lg:h-auto lg:min-h-0 lg:overflow-visible">
          <div
            tabIndex={0}
            role="group"
            aria-label="Кадры по категориям услуг"
            {...c.dragProps}
            className="absolute inset-0 touch-pan-y overflow-hidden select-none focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-teal lg:left-[37.41%] lg:cursor-grab lg:active:cursor-grabbing"
          >
            <HeroSlides
              pos={c.pos}
              dx={c.dx}
              fade={c.fade}
              moving={c.moving}
              warm={c.warm}
              onTransitionEnd={c.onTransitionEnd}
            />
          </div>

          {/* Затемнение под текстом нужно только в мобильной раскладке:
              на десктопе текст лежит на синей фигуре. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[28%] bottom-0 bg-gradient-to-t from-navy via-navy/88 to-transparent lg:hidden"
          />

          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <HeroShapes />
          </div>

          {/* Эталон десктопа: left 50, top 117, width 315 */}
          <div className="absolute inset-x-0 bottom-0 z-[2] px-5 pb-9 lg:top-[27%] lg:right-auto lg:bottom-auto lg:left-[5.31%] lg:w-[33.5%] lg:px-0 lg:pb-0">
            <div key={slide.key} className="animate-hero-in">
              <h1 className="h1 text-[clamp(1.5rem,2.94vw,3.25rem)] leading-[1.18] tracking-[0.04em] text-white">
                {slide.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="block text-teal">
                  {slide.accent.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </h1>

              <p className="mt-4 text-[clamp(0.9375rem,1.01vw,1.125rem)] leading-[1.55] text-white/95 lg:mt-[1.59vw]">
                {slide.note}
              </p>
            </div>

            {/* Поля и промежуток зависят от ширины круче, чем колонка: кегль
                упирается в свой минимум уже на 1024, и на прежних 2vw пара
                кнопок вылезала на бежевую полосу. */}
            <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-[3.2vw] lg:gap-[calc(1.49vw_-_4px)]">
              <a
                href="#zapis"
                className={`${CTA} gap-2 bg-teal text-white shadow-[0_8px_20px_rgba(17,184,194,0.22)] hover:bg-teal-hi hover:shadow-[0_10px_26px_rgba(17,184,194,0.32)]`}
              >
                Заказать онлайн
                <IconArrow className="h-4 w-4 lg:h-[1vw] lg:w-[1vw]" />
              </a>
              <a
                href="#uslugi"
                className={`${CTA} border border-white/72 text-white hover:border-white hover:bg-white/12`}
              >
                Узнать больше
              </a>
            </div>

            <div {...c.focusPauseProps} className="mt-7 flex justify-center lg:hidden">
              <HeroDots
                compact
                active={c.active}
                auto={c.auto}
                playing={c.playing}
                onJump={c.jumpTo}
                onDone={() => c.step(1)}
              />
            </div>
          </div>

          {/* На десктопе — капсула со стрелками на фотографии; на мобильной
              там свайп, поэтому только точки выше. */}
          <div
            {...c.focusPauseProps}
            className="absolute right-[3.4%] bottom-[9%] z-[3] hidden items-center rounded-full bg-white/72 p-[0.35vw] shadow-[0_8px_24px_rgba(14,26,53,0.16)] ring-1 ring-navy/10 backdrop-blur-[10px] lg:flex"
          >
            <button
              type="button"
              onClick={() => c.step(-1)}
              aria-label="Предыдущая категория"
              className="flex h-[2.2vw] w-[2.2vw] items-center justify-center rounded-full text-navy transition-[background-color,transform] duration-200 hover:bg-navy/8 active:scale-90"
            >
              <IconChevron className="h-[1vw] w-[1vw] rotate-180" />
            </button>

            <HeroDots
              active={c.active}
              auto={c.auto}
              playing={c.playing}
              onJump={c.jumpTo}
              onDone={() => c.step(1)}
            />

            <button
              type="button"
              onClick={() => c.step(1)}
              aria-label="Следующая категория"
              className="flex h-[2.2vw] w-[2.2vw] items-center justify-center rounded-full text-navy transition-[background-color,transform] duration-200 hover:bg-navy/8 active:scale-90"
            >
              <IconChevron className="h-[1vw] w-[1vw]" />
            </button>
          </div>
        </div>

        {/* На десктопе обёртка исчезает через display:contents, иначе
            абсолютные координаты карточек считались бы от неё. */}
        <div className="relative z-[3] mx-auto grid w-[calc(100%-40px)] gap-4 pt-6 pb-12 sm:grid-cols-2 lg:contents">
          <ExperienceCard />
          <OrderCard />
        </div>
      </section>
    </div>
  )
}
