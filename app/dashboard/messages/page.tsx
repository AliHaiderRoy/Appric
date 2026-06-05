import { getProfile } from "@/lib/auth/session"
import { getContactMessages } from "@/actions/contact-messages"
import { MessagesClient } from "@/components/dashboard/messages-client"
import { RoleGuard } from "@/components/dashboard/role-guard"

export default async function MessagesPage() {
  const profile = await getProfile()
  if (!profile) return null

  const messages = await getContactMessages().catch(() => [])

  return (
    <RoleGuard role={profile.role} minRole="hr">
      <MessagesClient initialMessages={messages} role={profile.role} />
    </RoleGuard>
  )
}
