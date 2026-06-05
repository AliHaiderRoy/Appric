import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { ServicesPreview } from "@/components/services-preview"
import { ClientLogos } from "@/components/client-logos"
import { CmsLiveRefresh } from "@/components/cms/cms-live-refresh"
import {
  getFeaturedServices,
  getHeroContent,
  getPublishedLogos,
  getStatsContent,
} from "@/lib/cms/queries"

export default async function Home() {
  const [hero, stats, services, logos] = await Promise.all([
    getHeroContent(),
    getStatsContent(),
    getFeaturedServices(),
    getPublishedLogos(),
  ])

  return (
    <div className="min-h-screen bg-black">
      <CmsLiveRefresh />
      <Header />
      <main>
        <HeroSection hero={hero} stats={stats} />
        <ServicesPreview services={services} />
        <ClientLogos logos={logos} />
      </main>
      <Footer />
    </div>
  )
}
