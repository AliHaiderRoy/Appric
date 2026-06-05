import { redirect } from "next/navigation"
import type { UserRole } from "@/lib/auth/roles"
import { hasMinimumRole } from "@/lib/auth/roles"

interface RoleGuardProps {
  role: UserRole | null | undefined
  minRole: UserRole
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ role, minRole, children, fallback }: RoleGuardProps) {
  if (!hasMinimumRole(role, minRole)) {
    if (fallback) return <>{fallback}</>
    redirect("/dashboard")
  }
  return <>{children}</>
}
