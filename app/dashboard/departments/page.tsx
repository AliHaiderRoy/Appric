import { getProfile } from "@/lib/auth/session"
import { getDepartments } from "@/actions/employees"
import { DepartmentsClient } from "@/components/dashboard/departments-client"
import { RoleGuard } from "@/components/dashboard/role-guard"

export default async function DepartmentsPage() {
  const profile = await getProfile()
  if (!profile) return null

  const departments = await getDepartments()

  return (
    <RoleGuard role={profile.role} minRole="hr">
      <DepartmentsClient departments={departments} />
    </RoleGuard>
  )
}
