import { notFound } from "next/navigation"
import { getProfile } from "@/lib/auth/session"
import { getEmployee } from "@/actions/employees"
import { getAttendanceHistory } from "@/actions/attendance"
import { getLeaveRequests } from "@/actions/leave"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRoleLabel, getRoleBadgeVariant } from "@/lib/auth/roles"
import { formatDate } from "@/lib/dashboard/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) return null

  const employee = await getEmployee(id)
  if (!employee) notFound()

  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const [attendance, leaveRequests] = await Promise.all([
    profile.id === id || ["admin", "hr"].includes(profile.role)
      ? getAttendanceHistory(month)
      : Promise.resolve([]),
    ["admin", "hr"].includes(profile.role) ? getLeaveRequests() : Promise.resolve([]),
  ])

  const employeeLeave = leaveRequests.filter((l) => l.user_id === id)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{employee.full_name}</h1>
          <p className="text-muted-foreground">{employee.email}</p>
        </div>
        <Badge variant={getRoleBadgeVariant(employee.role)}>{getRoleLabel(employee.role)}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Employee ID:</span> {employee.employee_id ?? "—"}</p>
            <p><span className="text-muted-foreground">Department ID:</span> {employee.department_id ?? "—"}</p>
            <p><span className="text-muted-foreground">Designation:</span> {employee.designation ?? "—"}</p>
            <p><span className="text-muted-foreground">Join Date:</span> {employee.join_date ? formatDate(employee.join_date) : "—"}</p>
            <p><span className="text-muted-foreground">Status:</span> {employee.status}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            {employeeLeave.length ? (
              <ul className="space-y-2 text-sm">
                {employeeLeave.slice(0, 5).map((l) => (
                  <li key={l.id} className="flex justify-between">
                    <span>{l.leave_type} · {formatDate(l.start_date)} – {formatDate(l.end_date)}</span>
                    <Badge variant="outline">{l.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No leave requests</p>
            )}
          </CardContent>
        </Card>
      </div>

      {attendance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{attendance.length} records</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
