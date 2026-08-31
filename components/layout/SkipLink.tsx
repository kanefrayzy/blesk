/** Ссылка в обход навигации. На главной содержание начинается с услуг,
 *  на внутренних страницах — с самого main. */
export function SkipLink({ href = '#uslugi' }: { href?: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2.5 focus:text-navy"
    >
      К содержанию
    </a>
  )
}
