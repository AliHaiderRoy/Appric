import { getProfile } from "@/lib/auth/session"
import { getCompanyAttendance } from "@/actions/attendance"
import { ReportsClient } from "@/components/dashboard/reports-client"
import { RoleGuard } from "@/components/dashboard/role-guard"
import { createClient } from "@/lib/supabase/server"
import { getTodayInTimezone, getSettingValue } from "@/lib/dashboard/utils"

export default async function ReportsPage() {
  const profile = await getProfile()
  if (!profile) return null

  const supabase = await createClient()
  const { data: settings } = await supabase.from("office_settings").select("key, value")
  const timezone = getSettingValue(settings ?? [], "timezone", "Asia/Karachi")

  const todayAttendance = await getCompanyAttendance(getTodayInTimezone(timezone))

  const statusCounts: Record<string, number> = {}
  if (Array.isArray(todayAttendance)) {
    for (const record of todayAttendance) {
      statusCounts[record.status] = (statusCounts[record.status] ?? 0) + 1
    }
  }

  const attendanceByStatus = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace("_", " "),
    value,
  }))

  if (!attendanceByStatus.length) {
    attendanceByStatus.push({ name: "No data", value: 1 })
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
  const weeklyData = days.map((day) => ({
    day,
    present: Math.floor(Math.random() * 20) + 5,
    late: Math.floor(Math.random() * 5),
    absent: Math.floor(Math.random() * 3),
  }))

  return (
    <RoleGuard role={profile.role} minRole="manager">
      <ReportsClient attendanceByStatus={attendanceByStatus} weeklyData={weeklyData} />
    </RoleGuard>
  )
}
