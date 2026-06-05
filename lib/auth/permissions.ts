import type { UserRole } from "./roles"
import { hasMinimumRole } from "./roles"

export type Permission =
  | "attendance:read_own"
  | "attendance:read_team"
  | "attendance:read_all"
  | "attendance:check_in"
  | "announcements:read"
  | "announcements:manage"
  | "news:read"
  | "news:manage"
  | "employees:read"
  | "employees:read_team"
  | "employees:manage"
  | "leave:read_own"
  | "leave:approve_team"
  | "leave:manage"
  | "departments:manage"
  | "settings:manage"
  | "reports:view"
  | "audit:read"

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "attendance:read_own",
    "attendance:read_team",
    "attendance:read_all",
    "attendance:check_in",
    "announcements:read",
    "announcements:manage",
    "news:read",
    "news:manage",
    "employees:read",
    "employees:read_team",
    "employees:manage",
    "leave:read_own",
    "leave:approve_team",
    "leave:manage",
    "departments:manage",
    "settings:manage",
    "reports:view",
    "audit:read",
  ],
  hr: [
    "attendance:read_own",
    "attendance:read_team",
    "attendance:read_all",
    "attendance:check_in",
    "announcements:read",
    "announcements:manage",
    "news:read",
    "news:manage",
    "employees:read",
    "employees:manage",
    "leave:read_own",
    "leave:approve_team",
    "leave:manage",
    "departments:manage",
    "reports:view",
  ],
  manager: [
    "attendance:read_own",
    "attendance:read_team",
    "attendance:check_in",
    "announcements:read",
    "news:read",
    "employees:read",
    "employees:read_team",
    "leave:read_own",
    "leave:approve_team",
    "reports:view",
  ],
  employee: [
    "attendance:read_own",
    "attendance:check_in",
    "announcements:read",
    "news:read",
    "leave:read_own",
  ],
}

export function hasPermission(
  role: UserRole | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function canManageEmployees(role: UserRole | null | undefined): boolean {
  return hasMinimumRole(role, "hr")
}

export function canApproveLeave(role: UserRole | null | undefined): boolean {
  return hasMinimumRole(role, "manager")
}
