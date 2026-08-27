import { SkipLink } from '@/components/layout/SkipLink'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { FloatingNav } from '@/components/navigation/FloatingNav'
import { MobileNav } from '@/components/navigation/MobileNav'
import { Hero } from '@/components/hero/Hero'
import { Stats } from '@/components/sections/Stats'
import { Services } from '@/components/sections/Services'
import { Cabinet } from '@/components/sections/Cabinet'
import { Production } from '@/components/sections/Production'
import { Clients } from '@/components/sections/Clients'
import { Contacts } from '@/components/sections/Contacts'

export default function Page() {
  return (
    <>
      <SkipLink />
      <FloatingNav />
      <MobileNav />

      <main>
        <Hero />
        <Stats />
        <Services />
        <Cabinet />
        <Production />
        <Clients />
        <Contacts />
      </main>

      <SiteFooter />
    </>
  )
}
