import { notFound } from "next/navigation"
import { getAnnouncement, markAnnouncementRead } from "@/actions/announcements"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/dashboard/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { id } = await params
  const announcement = await getAnnouncement(id)

  if (!announcement) notFound()

  await markAnnouncementRead(id)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge>{announcement.priority}</Badge>
            {announcement.is_pinned && <Badge variant="secondary">Pinned</Badge>}
          </div>
          <CardTitle className="text-2xl">{announcement.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatDateTime(announcement.created_at)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {announcement.content}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
