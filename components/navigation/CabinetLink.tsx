import { IconUser } from '@/components/ui/Icons'
import Link from 'next/link'

/** Кнопка «Личный кабинет» — одна на десктопное и мобильное меню. */
export function CabinetLink({
  className = '',
  onClick,
}: {
  className?: string
  onClick?: () => void
}) {
  return (
    <Link
      href="/vhod"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-full bg-navy text-[0.875rem] leading-none font-bold text-white transition-[background-color,transform] duration-200 hover:bg-navy-2 active:scale-[0.97] ${className}`}
    >
      Личный кабинет
      <IconUser className="h-4 w-4" />
    </Link>
  )
}
