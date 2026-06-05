import { getProfile } from "@/lib/auth/session"
import { getOfficeSettings } from "@/actions/settings"
import { SettingsClient } from "@/components/dashboard/settings-client"
import { RoleGuard } from "@/components/dashboard/role-guard"

export default async function SettingsPage() {
  const profile = await getProfile()
  if (!profile) return null

  const settings = await getOfficeSettings()

  return (
    <RoleGuard role={profile.role} minRole="admin">
      <SettingsClient settings={settings} />
    </RoleGuard>
  )
}
