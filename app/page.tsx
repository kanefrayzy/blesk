import { SkipLink } from '@/components/layout/SkipLink'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { FloatingNav } from '@/components/navigation/FloatingNav'
import { MobileNav } from '@/components/navigation/MobileNav'
import { Hero } from '@/components/hero/Hero'
import { Stats } from '@/components/sections/Stats'
import { Services } from '@/components/sections/Services'
import { OnlineOrder } from '@/components/sections/OnlineOrder'
import { Cabinet } from '@/components/sections/Cabinet'
import { Production } from '@/components/sections/Production'
import { Clients } from '@/components/sections/Clients'
import { Contacts } from '@/components/sections/Contacts'
import { schema } from '@/lib/seo'

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
      />

      <SkipLink />
      <FloatingNav />
      <MobileNav />

      <main>
        <Hero />
        <Stats />
        <Services />
        <OnlineOrder />
        <Cabinet />
        <Production />
        <Clients />
        <Contacts />
      </main>

      <SiteFooter />
    </>
  )
}
