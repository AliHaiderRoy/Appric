import { Users, Clock, CalendarDays, Shield } from "lucide-react"
import { getProfile } from "@/lib/auth/session"
import { getTodayAttendance } from "@/actions/attendance"
import { getAnnouncements } from "@/actions/announcements"
import { getNewsPosts } from "@/actions/news"
import { getDashboardStats } from "@/actions/employees"
import { getTeamAttendance } from "@/actions/attendance"
import { AttendanceWidget } from "@/components/dashboard/attendance-widget"
import { AnnouncementCard } from "@/components/dashboard/announcement-card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDate, ATTENDANCE_COLORS } from "@/lib/dashboard/utils"

export default async function DashboardPage() {
  const profile = await getProfile()
  if (!profile) return null

  const [todayRecord, announcements, news, stats, teamAttendance] = await Promise.all([
    getTodayAttendance(),
    getAnnouncements(),
    getNewsPosts(),
    getDashboardStats(),
    profile.role === "manager" ? getTeamAttendance() : Promise.resolve([]),
  ])

  const publishedNews = news.filter((n) => n.is_published).slice(0, 3)
  const recentAnnouncements = announcements.filter((a) => a.is_published).slice(0, 3)

  const roleStats = []

  if (["admin", "hr"].includes(profile.role)) {
    roleStats.push(
      { title: "Active Employees", value: stats.employees ?? 0, icon: Users },
      { title: "Pending Leave", value: stats.pendingLeave ?? 0, icon: CalendarDays }
    )
  }

  if (profile.role === "admin") {
    roleStats.push(
      { title: "Admins", value: stats.role_admin ?? 0, icon: Shield },
      { title: "HR Staff", value: stats.role_hr ?? 0, icon: Users }
    )
  }

  if (profile.role === "manager") {
    roleStats.push(
      { title: "Team Size", value: stats.teamSize ?? 0, icon: Users },
      { title: "Pending Approvals", value: stats.pendingTeamLeave ?? 0, icon: CalendarDays }
    )
  }

  if (profile.role === "employee") {
    roleStats.push({
      title: "Today Status",
      value: todayRecord?.status?.replace("_", " ") ?? "Not checked in",
      icon: Clock,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {profile.full_name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening at the office today.</p>
      </div>

      {roleStats.length > 0 && <StatsCards stats={roleStats} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <AttendanceWidget todayRecord={todayRecord} />

        {profile.role === "manager" && teamAttendance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {teamAttendance.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between text-sm">
                  <span>{member.full_name}</span>
                  <Badge
                    variant="outline"
                    className={
                      ATTENDANCE_COLORS[member.attendance?.status ?? "absent"]
                    }
                  >
                    {member.attendance?.check_in ? member.attendance.status : "absent"}
                  </Badge>
                </div>
              ))}
              <Link href="/dashboard/attendance" className="text-sm text-muted-foreground hover:underline">
                View all team attendance →
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Latest Announcements</CardTitle>
            <Link href="/dashboard/announcements" className="text-sm text-muted-foreground hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAnnouncements.length ? (
              recentAnnouncements.map((a) => (
                <AnnouncementCard key={a.id} announcement={a} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No announcements yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Office News</CardTitle>
            <Link href="/dashboard/news" className="text-sm text-muted-foreground hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {publishedNews.length ? (
              publishedNews.map((n) => (
                <Link key={n.id} href={`/dashboard/news/${n.slug}`} className="block rounded-lg border p-3 hover:bg-muted/50">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {n.category} · {n.published_at ? formatDate(n.published_at) : ""}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No news posts yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
