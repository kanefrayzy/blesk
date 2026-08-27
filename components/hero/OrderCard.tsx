import { BrandIcon } from '@/components/ui/BrandIcon'

const STAGES = ['Приём', 'Обработка', 'Выдача']

export function OrderCard() {
  return (
    <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15 lg:pointer-events-none lg:absolute lg:top-[69.4%] lg:left-[38.8%] lg:z-[3] lg:w-[23.2%] lg:rounded-[10px] lg:bg-white lg:p-[1.1vw] lg:shadow-[0_8px_21px_rgba(25,27,37,0.12)] lg:ring-0">
      <p className="flex items-center gap-2.5 text-[0.75rem] text-white/60 lg:gap-[0.5vw] lg:text-[0.72vw] lg:text-slate-soft">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white lg:h-[1.75vw] lg:w-[1.75vw] lg:bg-teal/10">
          <BrandIcon
            name="value-tehnologichnost.svg"
            className="h-4 w-4 lg:h-[1.05vw] lg:w-[1.05vw]"
          />
        </span>
        Путь вашей вещи
      </p>

      <b className="mt-3 block font-display text-[1.0625rem] font-bold text-white lg:mt-[0.5vw] lg:text-[0.98vw] lg:text-navy">
        Всё под одной крышей
      </b>
      <small className="mt-1 block text-[0.8125rem] text-white/60 lg:mt-[0.25vw] lg:text-[0.69vw] lg:text-slate-soft">
        От приёма до выдачи — в одном цехе
      </small>

      <div className="mt-4 lg:mt-[0.85vw]" aria-hidden="true">
        <div className="relative flex h-[3px] items-center justify-between rounded-full bg-white/20 lg:bg-teal/25">
          <span className="absolute inset-y-0 left-0 w-full rounded-full bg-teal" />
          {STAGES.map((s) => (
            <i
              key={s}
              className="relative block h-2.5 w-2.5 rounded-full border-2 border-white bg-teal shadow-[0_0_0_1px_rgba(20,164,175,0.35)]"
            />
          ))}
        </div>
        <div className="mt-2.5 flex justify-between text-[0.75rem] text-white/70 lg:mt-[0.5vw] lg:text-[0.69vw] lg:text-slate">
          {STAGES.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
