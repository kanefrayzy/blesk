import Image from 'next/image'

/** Логотип первого экрана. Разделы живут в FloatingNav и MobileNav. */
export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 hidden h-[7.8vw] items-center lg:flex">
      <a href="#top" aria-label="Блеск — на главную" className="absolute left-[3.4%]">
        <Image
          src="/brand/logo-h-white.svg"
          alt="Блеск — профессиональная химчистка"
          width={1701}
          height={482}
          priority
          className="h-[4.6vw] w-auto"
        />
      </a>
    </header>
  )
}
