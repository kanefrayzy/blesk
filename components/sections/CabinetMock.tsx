import Image from 'next/image'
import { IconCheck } from '@/components/ui/Icons'
import { cabinetMock as m, org } from '@/lib/content'

/**
 * Кабинет на компьютере и телефоне — вёрстка, а не картинка: текст остаётся
 * резким на любом экране, читается поиском и переводится вместе с сайтом.
 *
 * Кегли заданы в cqw с полом в пикселях: макет пропорционально ужимается
 * вместе с колонкой, но не уходит в нечитаемый размер на телефоне.
 */

const Mark = ({ className }: { className?: string }) => (
  <Image
    src="/brand/mark-navy.svg"
    alt=""
    aria-hidden="true"
    width={64}
    height={64}
    className={className}
  />
)

function Stepper() {
  return (
    <ol className="mt-[3.4cqw] flex items-start">
      {m.stages.map((name, i) => {
        const done = i < m.stage
        const now = i === m.stage
        return (
          <li key={name} className="relative flex flex-1 flex-col items-center">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute top-[1.05cqw] right-[50%] left-[-50%] h-[0.35cqw] rounded-full ${
                  done || now ? 'bg-teal' : 'bg-navy/12'
                }`}
              />
            )}
            <span
              className={`relative z-[1] block h-[2.1cqw] w-[2.1cqw] rounded-full ${
                done ? 'bg-teal' : now ? 'bg-teal ring-[0.7cqw] ring-teal/25' : 'bg-navy/15'
              }`}
            />
            <span
              className={`mt-[1.4cqw] text-center text-[max(7px,1.5cqw)] leading-tight ${
                done || now ? 'font-semibold text-navy' : 'text-slate-soft'
              }`}
            >
              {name}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function CabinetMock() {
  return (
    <div className="@container relative mx-auto w-full max-w-[34rem]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[6%] top-[10%] bottom-[6%] rounded-full bg-teal/15 blur-3xl"
      />

      {/* ------------------------------------------------- компьютер */}
      <div className="relative mr-[23cqw] overflow-hidden rounded-[2cqw] bg-white shadow-[0_24px_60px_rgba(5,12,30,0.45)] ring-1 ring-white/15">
        <div className="flex items-center gap-[1.4cqw] border-b border-line bg-mist px-[3cqw] py-[1.8cqw]">
          <span className="flex gap-[0.9cqw]" aria-hidden="true">
            <i className="block h-[1.2cqw] w-[1.2cqw] rounded-full bg-navy/15" />
            <i className="block h-[1.2cqw] w-[1.2cqw] rounded-full bg-navy/15" />
            <i className="block h-[1.2cqw] w-[1.2cqw] rounded-full bg-navy/15" />
          </span>
          <span className="ml-[1.4cqw] rounded-full bg-white px-[2.4cqw] py-[0.9cqw] text-[max(7px,1.5cqw)] text-slate-soft">
            {org.site}/lk
          </span>
        </div>

        <div className="px-[3.4cqw] pt-[3cqw] pb-[3.4cqw]">
          <div className="flex items-center gap-[1.6cqw]">
            <Mark className="h-[3.2cqw] w-[3.2cqw]" />
            <b className="font-display text-[max(9px,1.9cqw)] leading-none font-bold text-navy">
              Личный кабинет
            </b>
            <span className="ml-auto h-[3cqw] w-[3cqw] rounded-full bg-navy/8" aria-hidden="true" />
          </div>

          <div className="mt-[3cqw] rounded-[1.6cqw] bg-cream px-[3cqw] py-[2.6cqw]">
            <p className="flex items-baseline justify-between gap-[2cqw]">
              <span className="text-[max(7px,1.5cqw)] tracking-[0.12em] text-slate-soft uppercase">
                Текущий заказ
              </span>
              <span className="rounded-full bg-teal/12 px-[1.8cqw] py-[0.7cqw] text-[max(7px,1.5cqw)] font-semibold text-teal">
                {m.stages[m.stage]}
              </span>
            </p>
            <b className="mt-[1.2cqw] block font-display text-[max(10px,2.2cqw)] leading-tight font-bold text-navy">
              {m.item}
            </b>
            <Stepper />
          </div>

          <p className="mt-[3cqw] text-[max(7px,1.5cqw)] tracking-[0.12em] text-slate-soft uppercase">
            История заказов
          </p>
          <ul className="mt-[1.6cqw] space-y-[1.4cqw]">
            {m.history.map((h) => (
              <li
                key={h.item}
                className="flex items-center gap-[1.6cqw] rounded-[1.2cqw] bg-mist/70 px-[2.4cqw] py-[1.6cqw]"
              >
                <span
                  className={`flex h-[2.6cqw] w-[2.6cqw] shrink-0 items-center justify-center rounded-full ${
                    h.done ? 'bg-teal/15' : 'bg-navy/8'
                  }`}
                >
                  {h.done ? (
                    <IconCheck className="h-[1.4cqw] w-[1.4cqw] text-teal" />
                  ) : (
                    <i className="block h-[1cqw] w-[1cqw] rounded-full bg-navy/30" />
                  )}
                </span>
                <span className="truncate text-[max(8px,1.7cqw)] font-semibold text-navy">
                  {h.item}
                </span>
                <span className="ml-auto shrink-0 text-[max(7px,1.5cqw)] text-slate">
                  {h.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---------------------------------------------------- телефон */}
      <div className="absolute right-0 -bottom-[3cqw] w-[26cqw] rounded-[3.4cqw] bg-white p-[1cqw] shadow-[0_18px_44px_rgba(5,12,30,0.5)] ring-1 ring-white/20">
        <div className="overflow-hidden rounded-[2.6cqw] bg-white">
          <div className="flex justify-center pt-[1.4cqw]" aria-hidden="true">
            <span className="h-[0.8cqw] w-[7cqw] rounded-full bg-navy/12" />
          </div>

          <div className="px-[2.4cqw] pt-[2cqw] pb-[1.5cqw]">
            <Mark className="h-[2.6cqw] w-[2.6cqw]" />

            <p className="mt-[2cqw] text-[max(7px,1.4cqw)] tracking-[0.1em] text-slate-soft uppercase">
              Статус
            </p>
            <b className="mt-[0.6cqw] block font-display text-[max(9px,2cqw)] leading-tight font-bold text-navy">
              {m.stages[m.stage]}
            </b>
            <span className="mt-[0.8cqw] block truncate text-[max(7px,1.4cqw)] text-slate">
              {m.item}
            </span>

            <span
              aria-hidden="true"
              className="mt-[2.2cqw] block h-[0.9cqw] overflow-hidden rounded-full bg-navy/10"
            >
              <span
                className="block h-full rounded-full bg-teal"
                style={{ width: `${((m.stage + 1) / m.stages.length) * 100}%` }}
              />
            </span>

            <div className="mt-[2.6cqw] grid grid-cols-4 border-t border-line pt-[1.5cqw] text-center text-[max(5px,1cqw)] text-slate-soft">
              <span className="text-teal">Заказы</span>
              <span>История</span>
              <span>Запись</span>
              <span>Профиль</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
