import { CmsLiveRefresh } from "@/components/cms/cms-live-refresh"
import { PortfolioView } from "@/components/pages/portfolio-view"
import { getPublishedPortfolio } from "@/lib/cms/queries"

export default async function PortfolioPage() {
  const projects = await getPublishedPortfolio()

  return (
    <>
      <CmsLiveRefresh />
      <PortfolioView projects={projects} />
    </>
  )
}
