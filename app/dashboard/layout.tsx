import { redirect } from "next/navigation"
import { getProfile } from "@/lib/auth/session"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardNavbar } from "@/components/dashboard/navbar"
import { DashboardProviders } from "@/components/dashboard/providers"
import { getUnreadAnnouncementCount } from "@/actions/announcements"
import { getPendingLeaveCount } from "@/actions/leave"
import { getUnreadContactMessageCount } from "@/actions/contact-messages"
import { hasMinimumRole } from "@/lib/auth/roles"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()
  if (!profile) redirect("/auth/login")

  const [unreadAnnouncements, pendingLeave, unreadContactMessages] = await Promise.all([
    getUnreadAnnouncementCount().catch(() => 0),
    getPendingLeaveCount().catch(() => 0),
    getUnreadContactMessageCount().catch(() => 0),
  ])

  const showContactInbox = hasMinimumRole(profile.role, "hr")

  return (
    <DashboardProviders>
      <SidebarProvider>
        <DashboardSidebar role={profile.role} />
        <SidebarInset>
          <DashboardNavbar
            profile={profile}
            unreadAnnouncements={unreadAnnouncements}
            pendingLeave={pendingLeave}
            unreadContactMessages={unreadContactMessages}
            showContactInbox={showContactInbox}
          />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProviders>
  )
}
