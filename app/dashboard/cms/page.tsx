import { getProfile } from "@/lib/auth/session"
import { getAdminCmsData } from "@/lib/cms/queries"
import { CmsClient } from "@/components/dashboard/cms-client"
import { RoleGuard } from "@/components/dashboard/role-guard"

export default async function CmsPage() {
  const profile = await getProfile()
  if (!profile) return null

  const data = await getAdminCmsData()

  return (
    <RoleGuard role={profile.role} minRole="admin">
      <CmsClient data={data} />
    </RoleGuard>
  )
}
