import { CmsLiveRefresh } from "@/components/cms/cms-live-refresh"
import { ContactView } from "@/components/pages/contact-view"
import { getContactContent } from "@/lib/cms/queries"

export default async function ContactPage() {
  const contact = await getContactContent()

  return (
    <>
      <CmsLiveRefresh />
      <ContactView contact={contact} />
    </>
  )
}
