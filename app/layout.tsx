import type { Metadata, Viewport } from 'next'
import { TikTok_Sans } from 'next/font/google'
import { CookieNotice } from '@/components/layout/CookieNotice'
import { SmoothAnchors } from '@/components/layout/SmoothAnchors'
import { YandexMetrika } from '@/components/metrics/YandexMetrika'
import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/seo'
import './globals.css'

/** TikTok Sans — фирменная гарнитура брендбука, по решению заказчика одна на всю страницу. */
const tiktok = TikTok_Sans({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-tiktok',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Химчистка «Блеск» — профессиональный уход за вещами в Жуковском',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  // Коды подтверждения приходят из панелей вебмастера, поэтому берутся из
  // окружения: без переменной тег просто не выводится.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={tiktok.variable}>
      <body>
        {children}
        <YandexMetrika />
        <SmoothAnchors />
        <CookieNotice />
      </body>
    </html>
  )
}
