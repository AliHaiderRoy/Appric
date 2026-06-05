import { getProfile } from "@/lib/auth/session"
import {
  getTodayAttendance,
  getAttendanceHistory,
  getTeamAttendance,
  getCompanyAttendance,
} from "@/actions/attendance"
import { CheckInButton } from "@/components/dashboard/check-in-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ATTENDANCE_COLORS, formatDate, formatDateTime } from "@/lib/dashboard/utils"

export default async function AttendancePage() {
  const profile = await getProfile()
  if (!profile) return null

  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const [todayRecord, history, teamData, companyData] = await Promise.all([
    getTodayAttendance(),
    getAttendanceHistory(month),
    ["manager", "admin", "hr"].includes(profile.role) ? getTeamAttendance() : Promise.resolve([]),
    ["admin", "hr"].includes(profile.role) ? getCompanyAttendance() : Promise.resolve([]),
  ])

  const presentDays = history.filter((h) => ["present", "late", "remote"].includes(h.status)).length
  const lateDays = history.filter((h) => h.status === "late").length
  const totalHours = history.reduce((sum, h) => sum + (h.total_hours ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">Track your daily check-in and attendance history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckInButton todayRecord={todayRecord} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Present Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{presentDays}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Late Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{lateDays}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {history.map((record) => (
              <div
                key={record.id}
                className={`flex h-10 w-10 items-center justify-center rounded-md border text-xs font-medium ${ATTENDANCE_COLORS[record.status]}`}
                title={`${record.date}: ${record.status}`}
              >
                {new Date(record.date).getDate()}
              </div>
            ))}
            {!history.length && (
              <p className="text-sm text-muted-foreground">No attendance records this month</p>
            )}
          </div>
        </CardContent>
      </Card>

      {profile.role === "manager" && teamData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Attendance Today</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamData.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ATTENDANCE_COLORS[member.attendance?.status ?? "absent"]}>
                        {member.attendance?.status ?? "absent"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.attendance?.check_in ? formatDateTime(member.attendance.check_in) : "—"}
                    </TableCell>
                    <TableCell>
                      {member.attendance?.check_out ? formatDateTime(member.attendance.check_out) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {["admin", "hr"].includes(profile.role) && Array.isArray(companyData) && companyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Attendance Today</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {record.profile?.full_name ?? record.user_id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ATTENDANCE_COLORS[record.status]}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.check_in ? formatDateTime(record.check_in) : "—"}</TableCell>
                    <TableCell>{record.total_hours ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
