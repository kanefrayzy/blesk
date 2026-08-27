import type { Metadata, Viewport } from 'next'
import { TikTok_Sans } from 'next/font/google'
import './globals.css'

/** TikTok Sans — фирменная гарнитура брендбука, по решению заказчика одна на всю страницу. */
const tiktok = TikTok_Sans({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-tiktok',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://bleskvip.ru'),
  title: 'Блеск — профессиональная химчистка в Жуковском',
  description:
    'Собственное производство в Жуковском на Энергетической: цех 100+ м², итальянское оборудование, 15+ лет опыта и контроль качества под одной крышей.',
  icons: { icon: '/brand/favicon.svg' },
  openGraph: {
    title: 'Блеск — профессиональная химчистка в Жуковском',
    description: 'Собственный цех 100+ м² в Жуковском. Вашу вещь никуда не увозят.',
    locale: 'ru_RU',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={tiktok.variable}>
      <body>{children}</body>
    </html>
  )
}
