"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireAuth, requireRole } from "@/lib/auth/session"
import type { LeaveStatus } from "@/types/database.types"

import { leaveRequestSchema } from "@/lib/validations/employee"

export async function getLeaveRequests(status?: string) {
  const profile = await requireAuth()
  const supabase = await createClient()

  let query = supabase
    .from("leave_requests")
    .select("*")
    .order("created_at", { ascending: false })

  if (profile.role === "employee") {
    query = query.eq("user_id", profile.id)
  } else if (profile.role === "manager") {
    const { data: team } = await supabase
      .from("profiles")
      .select("id")
      .eq("manager_id", profile.id)

    const ids = team?.map((t) => t.id) ?? []
    if (ids.length) {
      query = query.in("user_id", ids)
    } else {
      return []
    }
  }

  if (status) query = query.eq("status", status as LeaveStatus)

  const { data } = await query
  if (!data?.length) return []

  const userIds = [...new Set(data.map((r) => r.user_id))]
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, employee_id")
    .in("id", userIds)

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? [])

  return data.map((req) => ({
    ...req,
    profile: profileMap.get(req.user_id) ?? null,
  }))
}

export async function applyLeave(formData: FormData) {
  const profile = await requireAuth()

  const parsed = leaveRequestSchema.safeParse({
    leaveType: formData.get("leaveType"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("leave_requests").insert({
    user_id: profile.id,
    leave_type: parsed.data.leaveType,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
    reason: parsed.data.reason,
  })

  if (error) return { error: error.message }

  revalidatePath("/dashboard/leave")
  return { success: true }
}

export async function updateLeaveStatus(
  id: string,
  status: "approved" | "rejected" | "cancelled",
  comment?: string
) {
  const profile = await requireAuth()
  const supabase = await createClient()

  const { data: request } = await supabase
    .from("leave_requests")
    .select("*")
    .eq("id", id)
    .single()

  if (!request) return { error: "Leave request not found" }

  const canApprove =
    ["admin", "hr"].includes(profile.role) ||
    (profile.role === "manager" && request.user_id !== profile.id)

  if (!canApprove && status !== "cancelled") {
    return { error: "Forbidden" }
  }

  if (status === "cancelled" && request.user_id !== profile.id) {
    return { error: "Forbidden" }
  }

  const { error } = await supabase
    .from("leave_requests")
    .update({
      status,
      approved_by: status === "approved" || status === "rejected" ? profile.id : null,
      comment: comment ?? null,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/leave")
  return { success: true }
}

export async function getPendingLeaveCount() {
  const profile = await requireAuth()
  if (!["admin", "hr", "manager"].includes(profile.role)) return 0

  const supabase = await createClient()
  let query = supabase
    .from("leave_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  if (profile.role === "manager") {
    const { data: team } = await supabase
      .from("profiles")
      .select("id")
      .eq("manager_id", profile.id)

    const ids = team?.map((t) => t.id) ?? []
    if (!ids.length) return 0
    query = query.in("user_id", ids)
  }

  const { count } = await query
  return count ?? 0
}
