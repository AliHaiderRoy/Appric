"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth, requireRole } from "@/lib/auth/session"
import type { UserRole, EmployeeStatus } from "@/types/database.types"

import { employeeSchema, departmentSchema, profileUpdateSchema } from "@/lib/validations/employee"

export async function getEmployees(filters?: {
  department?: string
  role?: string
  status?: string
  search?: string
}) {
  const profile = await requireAuth()
  const supabase = await createClient()

  let query = supabase
    .from("profiles")
    .select("*")
    .order("full_name")

  if (profile.role === "manager") {
    query = query.eq("manager_id", profile.id)
  }

  if (filters?.department) query = query.eq("department_id", filters.department)
  if (filters?.role) query = query.eq("role", filters.role as UserRole)
  if (filters?.status) query = query.eq("status", filters.status as EmployeeStatus)
  if (filters?.search) {
    query = query.or(
      `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employee_id.ilike.%${filters.search}%`
    )
  }

  const { data } = await query
  return data ?? []
}

export async function getEmployee(id: string) {
  await requireAuth()
  const supabase = await createClient()

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  return data
}

export async function updateEmployee(id: string, formData: FormData) {
  await requireRole("hr")

  const parsed = employeeSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    departmentId: formData.get("departmentId") || null,
    managerId: formData.get("managerId") || null,
    employeeId: formData.get("employeeId") || null,
    phone: formData.get("phone") || null,
    designation: formData.get("designation") || null,
    joinDate: formData.get("joinDate") || null,
    status: formData.get("status"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      role: parsed.data.role,
      department_id: parsed.data.departmentId ?? null,
      manager_id: parsed.data.managerId ?? null,
      employee_id: parsed.data.employeeId ?? null,
      phone: parsed.data.phone ?? null,
      designation: parsed.data.designation ?? null,
      join_date: parsed.data.joinDate ?? null,
      status: parsed.data.status,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/employees")
  revalidatePath(`/dashboard/employees/${id}`)
  return { success: true }
}

export async function updateProfile(formData: FormData) {
  const profile = await requireAuth()

  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || null,
    designation: formData.get("designation") || null,
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
      designation: parsed.data.designation ?? null,
    })
    .eq("id", profile.id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/profile")
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const profile = await requireAuth()
  const file = formData.get("avatar") as File | null

  if (!file?.size) return { error: "No file provided" }

  const supabase = await createClient()
  const { uploadImageFile, IMAGE_BUCKETS } = await import("@/lib/storage/image-upload")
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const result = await uploadImageFile(supabase, IMAGE_BUCKETS.avatars, file, profile.id, {
    objectPath: `${profile.id}/avatar.${ext}`,
  })

  if ("error" in result) return { error: result.error }

  const avatarUrl = `${result.url}?v=${Date.now()}`

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", profile.id)

  if (updateError) return { error: updateError.message }

  revalidatePath("/dashboard/profile")
  revalidatePath("/dashboard", "layout")
  revalidatePath("/", "layout")
  return { success: true, url: avatarUrl }
}

export async function getDepartments() {
  await requireAuth()
  const supabase = await createClient()
  const { data } = await supabase
    .from("departments")
    .select("*")
    .order("name")
  return data ?? []
}

export async function createDepartment(formData: FormData) {
  await requireRole("hr")

  const parsed = departmentSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    headId: formData.get("headId") || null,
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("departments").insert({
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    head_id: parsed.data.headId ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath("/dashboard/departments")
  return { success: true }
}

export async function getDashboardStats() {
  const profile = await requireAuth()
  const supabase = await createClient()

  const stats: Record<string, number> = {}

  if (["admin", "hr"].includes(profile.role)) {
    const { count: employeeCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    const { count: pendingLeave } = await supabase
      .from("leave_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    stats.employees = employeeCount ?? 0
    stats.pendingLeave = pendingLeave ?? 0
  }

  if (profile.role === "admin") {
    const roles = ["admin", "hr", "manager", "employee"] as const
    for (const role of roles) {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", role)
      stats[`role_${role}`] = count ?? 0
    }
  }

  if (profile.role === "manager") {
    const { count: teamCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("manager_id", profile.id)

    const { count: pendingTeamLeave } = await supabase
      .from("leave_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    stats.teamSize = teamCount ?? 0
    stats.pendingTeamLeave = pendingTeamLeave ?? 0
  }

  return stats
}
