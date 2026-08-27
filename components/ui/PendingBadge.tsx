/** Пунктирный ярлык на месте неподтверждённых данных — см. PRODUCT.md. */
export function PendingBadge({
  children,
  tone = 'light',
  className = '',
}: {
  children: React.ReactNode
  tone?: 'light' | 'dark'
  className?: string
}) {
  const skin = tone === 'dark' ? 'border-white/30' : 'border-slate-soft/60'
  return (
    <span
      className={`mr-1.5 inline-block rounded border border-dashed px-1.5 py-0.5 align-[0.1em] text-[0.625rem] leading-none tracking-wider uppercase ${skin} ${className}`}
    >
      {children}
    </span>
  )
}
