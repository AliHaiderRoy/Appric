import Link from "next/link"
import { Plus } from "lucide-react"
import { getProfile } from "@/lib/auth/session"
import { getEmployees } from "@/actions/employees"
import { EmployeeTable } from "@/components/dashboard/employee-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleGuard } from "@/components/dashboard/role-guard"
import { hasMinimumRole } from "@/lib/auth/roles"

export default async function EmployeesPage() {
  const profile = await getProfile()
  if (!profile) return null

  const employees = await getEmployees()
  const canManage = hasMinimumRole(profile.role, "hr")

  return (
    <RoleGuard role={profile.role} minRole="manager">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Employees</h1>
            <p className="text-muted-foreground">Manage team members and roles</p>
          </div>
          {canManage && (
            <Button asChild>
              <Link href="/dashboard/employees/new">
                <Plus className="mr-2 h-4 w-4" />
                Invite Employee
              </Link>
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {employees.length} employee{employees.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeTable employees={employees} />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
