export const ROLES = ["admin", "hr", "manager", "employee"] as const
export type UserRole = (typeof ROLES)[number]

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 4,
  hr: 3,
  manager: 2,
  employee: 1,
}

export function hasMinimumRole(
  userRole: UserRole | null | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function canAccessRoute(
  userRole: UserRole | null | undefined,
  routePrefix: string
): boolean {
  if (!userRole) return false

  if (routePrefix.startsWith("/dashboard/admin")) {
    return userRole === "admin"
  }
  if (routePrefix.startsWith("/dashboard/hr")) {
    return hasMinimumRole(userRole, "hr")
  }
  if (routePrefix.startsWith("/dashboard/manager")) {
    return hasMinimumRole(userRole, "manager")
  }
  if (routePrefix.startsWith("/dashboard/settings")) {
    return userRole === "admin"
  }
  if (routePrefix.startsWith("/dashboard/departments")) {
    return hasMinimumRole(userRole, "hr")
  }
  if (routePrefix.startsWith("/dashboard/employees/new")) {
    return hasMinimumRole(userRole, "hr")
  }
  if (routePrefix.startsWith("/dashboard/reports")) {
    return hasMinimumRole(userRole, "manager")
  }

  return true
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Admin",
    hr: "HR",
    manager: "Manager",
    employee: "Employee",
  }
  return labels[role]
}

export function getRoleBadgeVariant(
  role: UserRole
): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
    admin: "destructive",
    hr: "default",
    manager: "secondary",
    employee: "outline",
  }
  return variants[role]
}
