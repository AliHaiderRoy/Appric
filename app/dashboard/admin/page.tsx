import { getProfile } from "@/lib/auth/session"
import { getAuditLogs } from "@/actions/settings"
import { getDashboardStats } from "@/actions/employees"
import { RoleGuard } from "@/components/dashboard/role-guard"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield } from "lucide-react"
import { formatDateTime } from "@/lib/dashboard/utils"

export default async function AdminPage() {
  const profile = await getProfile()
  if (!profile) return null

  const [stats, auditLogs] = await Promise.all([
    getDashboardStats(),
    getAuditLogs(10),
  ])

  return (
    <RoleGuard role={profile.role} minRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">System overview and audit logs</p>
        </div>

        <StatsCards
          stats={[
            { title: "Total Employees", value: stats.employees ?? 0, icon: Users },
            { title: "Admins", value: stats.role_admin ?? 0, icon: Shield },
            { title: "HR Staff", value: stats.role_hr ?? 0, icon: Users },
            { title: "Managers", value: stats.role_manager ?? 0, icon: Users },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {auditLogs.length ? (
              <ul className="space-y-3">
                {auditLogs.map((log) => (
                  <li key={log.id} className="flex items-start justify-between border-b pb-2 text-sm last:border-0">
                    <div>
                      <p className="font-medium">
                        {log.action} — {log.entity_type}
                      </p>
                      <p className="text-muted-foreground">
                        {log.entity_type} {log.entity_id ? `· ${log.entity_id}` : ""}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No audit logs yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
