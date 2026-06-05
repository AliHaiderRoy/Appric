import Link from "next/link"
import { Plus } from "lucide-react"
import { getProfile } from "@/lib/auth/session"
import { getAnnouncements } from "@/actions/announcements"
import { AnnouncementCard } from "@/components/dashboard/announcement-card"
import { Button } from "@/components/ui/button"
import { hasMinimumRole } from "@/lib/auth/roles"

export default async function AnnouncementsPage() {
  const profile = await getProfile()
  if (!profile) return null

  const announcements = await getAnnouncements()
  const canManage = hasMinimumRole(profile.role, "hr")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Company-wide updates and notices</p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/dashboard/announcements/new">
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {announcements.length ? (
          announcements.map((a) => <AnnouncementCard key={a.id} announcement={a} />)
        ) : (
          <p className="text-muted-foreground">No announcements yet</p>
        )}
      </div>
    </div>
  )
}
