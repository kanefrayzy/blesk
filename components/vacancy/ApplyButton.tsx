'use client'

import { IconArrow } from '@/components/ui/Icons'

export const VACANCY_PICK = 'blesk:vacancy-pick'

/** Ведёт к форме отклика и подставляет в неё должность. */
export function ApplyButton({ title }: { title: string }) {
  return (
    <a
      href="#otklik"
      onClick={() => window.dispatchEvent(new CustomEvent(VACANCY_PICK, { detail: title }))}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal px-6 font-display text-[0.8125rem] font-extrabold tracking-wide whitespace-nowrap text-white uppercase shadow-[0_8px_20px_rgba(17,184,194,0.22)] transition-[background-color,transform,box-shadow] duration-200 hover:bg-teal-hi hover:shadow-[0_10px_26px_rgba(17,184,194,0.32)] active:scale-[0.97]"
    >
      Откликнуться
      <IconArrow className="h-4 w-4" />
    </a>
  )
}
