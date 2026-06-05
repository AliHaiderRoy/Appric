import { getProfile } from "@/lib/auth/session"
import { getEmployee } from "@/actions/employees"
import { ProfileClient } from "@/components/dashboard/profile-client"

export default async function ProfilePage() {
  const profile = await getProfile()
  if (!profile) return null

  const fullProfile = await getEmployee(profile.id)

  return <ProfileClient profile={fullProfile ?? profile} />
}
