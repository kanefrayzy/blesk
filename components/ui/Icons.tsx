/** Штриховые иконки в одной грамматике: 24×24, обводка 1.6, круглые концы. */
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: 'false' as const,
}

export type IconProps = { className?: string }

export function IconUser({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8.4" r="3.6" />
      <path d="M4.8 20c.6-3.7 3.6-6 7.2-6s6.6 2.3 7.2 6" />
    </svg>
  )
}

export function IconArrow({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 12h14" />
      <path d="m13 6.5 5.5 5.5L13 17.5" />
    </svg>
  )
}

export function IconChevron({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </svg>
  )
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 12.5 9.5 18 20 6.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Оценка в отзывах: фирменная четырёхлучевая искра как рейтинг не читается. */
export function IconStar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 2.4c.3 0 .58.17.72.45l2.6 5.28 5.83.85c.31.04.57.26.66.56a.8.8 0 0 1-.2.82l-4.22 4.11.996 5.8a.8.8 0 0 1-1.16.84L12 18.37l-5.22 2.74a.8.8 0 0 1-1.16-.84l.996-5.8-4.21-4.11a.8.8 0 0 1-.2-.82c.09-.3.35-.52.66-.56l5.82-.85 2.6-5.28c.14-.28.42-.45.72-.45Z"
      />
    </svg>
  )
}

export function IconTelegram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M21.2 4.3 2.9 11.4c-.9.3-.9 1.6.1 1.9l4.6 1.4 1.8 5.4c.2.7 1.1.9 1.6.3l2.5-2.6 4.7 3.5c.6.5 1.5.1 1.6-.6l2.8-15c.2-.8-.6-1.5-1.4-1.2ZM8.9 14.1 17.6 8l-6.9 6.9-.3 3.1-1.5-3.9Z"
      />
    </svg>
  )
}

export function IconVk({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12.9 17.1c-5 0-8.2-3.5-8.3-9.3h2.6c.1 4.3 2.1 6.1 3.6 6.5V7.8h2.4v3.6c1.4-.2 2.9-1.8 3.4-3.6h2.4c-.4 2.2-1.9 3.9-3 4.6 1.1.5 2.8 2 3.5 4.7h-2.6c-.5-1.7-1.9-3-3.7-3.2v3.2h-.3Z"
      />
    </svg>
  )
}
