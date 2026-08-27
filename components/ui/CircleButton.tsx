type Props = {
  label: string
  size?: 'sm' | 'md'
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

/** Круглая кнопка перелистывания: лента услуг и отзывы используют одну и ту же. */
export function CircleButton({ label, size = 'md', disabled, onClick, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex items-center justify-center rounded-full border border-line text-navy transition-[color,border-color,background-color,transform] duration-200 hover:border-teal hover:bg-teal/8 hover:text-teal active:scale-90 disabled:pointer-events-none disabled:border-line disabled:text-slate-soft/40 ${
        size === 'sm' ? 'h-9 w-9 text-slate' : 'h-12 w-12'
      }`}
    >
      {children}
    </button>
  )
}
