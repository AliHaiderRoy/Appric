import Link from "next/link"
import { Pin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AnnouncementWithAuthor } from "@/types/database.types"
import { formatDate } from "@/lib/dashboard/utils"

const priorityColors: Record<string, string> = {
  low: "secondary",
  normal: "outline",
  high: "default",
  urgent: "destructive",
}

interface AnnouncementCardProps {
  announcement: AnnouncementWithAuthor
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <Link href={`/dashboard/announcements/${announcement.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              {announcement.is_pinned && <Pin className="h-4 w-4 text-muted-foreground" />}
              {!announcement.is_read && (
                <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
              )}
              {announcement.title}
            </CardTitle>
            <Badge variant={priorityColors[announcement.priority] as "default"}>
              {announcement.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">{announcement.content}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDate(announcement.created_at)}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
