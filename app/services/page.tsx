import { CmsLiveRefresh } from "@/components/cms/cms-live-refresh"
import { ServicesView } from "@/components/pages/services-view"
import { getPublishedServices, getServicesPageContent } from "@/lib/cms/queries"

export default async function ServicesPage() {
  const [services, pageContent] = await Promise.all([getPublishedServices(), getServicesPageContent()])

  return (
    <>
      <CmsLiveRefresh />
      <ServicesView services={services} pageContent={pageContent} />
    </>
  )
}
