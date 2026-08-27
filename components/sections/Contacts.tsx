import { Container } from '@/components/ui/Container'
import { PickupPoint } from '@/components/sections/PickupPoint'
import { Reviews } from '@/components/sections/Reviews'

export function Contacts() {
  return (
    <section className="bg-cream">
      <Container className="grid gap-6 pt-12 pb-16 lg:grid-cols-[0.85fr_1.15fr]">
        <Reviews />
        <PickupPoint />
      </Container>
    </section>
  )
}
