import type { Metadata } from 'next'
import { CabinetDashboard } from '@/components/cabinet/CabinetDashboard'

export const metadata: Metadata = {
  title: 'Личный кабинет',
  description: 'Заказы, статусы и фотографии изделий в химчистке «Блеск».',
  robots: { index: false, follow: false },
}

export default function CabinetPage() {
  return <CabinetDashboard />
}
