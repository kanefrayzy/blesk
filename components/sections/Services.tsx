import { Container } from '@/components/ui/Container'
import { ServicesSlider } from '@/components/sections/ServicesSlider'

export function Services() {
  return (
    <section id="uslugi" aria-labelledby="uslugi-title" className="bg-white">
      <Container className="py-16 lg:py-20">
        <h2 id="uslugi-title" className="h2 text-center text-[clamp(1.5rem,2.6vw,2rem)] text-navy">
          Наши услуги
        </h2>

        <ServicesSlider />
      </Container>
    </section>
  )
}
