"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth/session"
import type { Json, AttendanceStatus, OfficeSetting } from "@/types/database.types"
import { getTodayInTimezone, getTimeInTimezone, getSettingValue } from "@/lib/dashboard/utils"

const checkInRateLimit = new Map<string, number>()
const RATE_LIMIT_MS = 5000

function isRateLimited(userId: string): boolean {
  const last = checkInRateLimit.get(userId)
  const now = Date.now()
  if (last && now - last < RATE_LIMIT_MS) return true
  checkInRateLimit.set(userId, now)
  return false
}

async function getOfficeSettings(): Promise<Pick<OfficeSetting, "key" | "value">[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("office_settings").select("key, value")
  return data ?? []
}

function determineStatus(
  _checkInTime: string,
  settings: Pick<OfficeSetting, "key" | "value">[]
): "present" | "late" {
  const workStart = getSettingValue(settings, "work_start_time", "09:00")
  const threshold = parseInt(getSettingValue(settings, "late_threshold_minutes", "15"), 10)
  const timezone = getSettingValue(settings, "timezone", "Asia/Karachi")

  const today = getTodayInTimezone(timezone)
  const [startHour, startMin] = workStart.split(":").map(Number)
  const lateMinutes = startHour * 60 + startMin + threshold

  const currentTime = getTimeInTimezone(timezone)
  const [curHour, curMin] = currentTime.split(":").map(Number)
  const currentMinutes = curHour * 60 + curMin

  return currentMinutes > lateMinutes ? "late" : "present"
}

export async function checkIn(workMode: "office" | "remote" | "hybrid" = "office") {
  const profile = await requireAuth()

  if (isRateLimited(profile.id)) {
    return { error: "Please wait before checking in again" }
  }

  const supabase = await createClient()
  const settings = await getOfficeSettings()
  const timezone = getSettingValue(settings, "timezone", "Asia/Karachi")
  const today = getTodayInTimezone(timezone)

  const { data: existing } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", profile.id)
    .eq("date", today)
    .maybeSingle()

  if (existing?.check_in) {
    return { error: "Already checked in today" }
  }

  const now = new Date().toISOString()
  const status = determineStatus(now, settings)
  const finalStatus = workMode === "remote" ? "remote" : status

  if (existing) {
    const { error } = await supabase
      .from("attendance")
      .update({
        check_in: now,
        status: finalStatus,
        work_mode: workMode,
      })
      .eq("id", existing.id)

    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from("attendance").insert({
      user_id: profile.id,
      check_in: now,
      date: today,
      status: finalStatus,
      work_mode: workMode,
    })

    if (error) return { error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/attendance")
  return { success: true, checkIn: now }
}

export async function checkOut(notes?: string) {
  const profile = await requireAuth()

  if (isRateLimited(profile.id)) {
    return { error: "Please wait before checking out again" }
  }

  const supabase = await createClient()
  const settings = await getOfficeSettings()
  const timezone = getSettingValue(settings, "timezone", "Asia/Karachi")
  const today = getTodayInTimezone(timezone)

  const { data: record } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", profile.id)
    .eq("date", today)
    .maybeSingle()

  if (!record?.check_in) {
    return { error: "No check-in found for today" }
  }

  if (record.check_out) {
    return { error: "Already checked out today" }
  }

  const now = new Date().toISOString()
  let status = record.status

  const workEnd = getSettingValue(settings, "work_end_time", "18:00")
  const currentTime = getTimeInTimezone(timezone)
  const [endHour, endMin] = workEnd.split(":").map(Number)
  const [curHour, curMin] = currentTime.split(":").map(Number)
  const endMinutes = endHour * 60 + endMin
  const currentMinutes = curHour * 60 + curMin

  if (currentMinutes < endMinutes - 60) {
    status = "half_day"
  }

  const { error } = await supabase
    .from("attendance")
    .update({
      check_out: now,
      status,
      notes: notes ?? record.notes,
    })
    .eq("id", record.id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/attendance")
  return { success: true, checkOut: now }
}

export async function getTodayAttendance(userId?: string) {
  const profile = await requireAuth()
  const targetId = userId ?? profile.id
  const supabase = await createClient()
  const settings = await getOfficeSettings()
  const timezone = getSettingValue(settings, "timezone", "Asia/Karachi")
  const today = getTodayInTimezone(timezone)

  const { data } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", targetId)
    .eq("date", today)
    .maybeSingle()

  return data
}

export async function getAttendanceHistory(month: string) {
  const profile = await requireAuth()
  const supabase = await createClient()
  const [year, mon] = month.split("-").map(Number)
  const startDate = `${year}-${String(mon).padStart(2, "0")}-01`
  const endDate = `${year}-${String(mon).padStart(2, "0")}-31`

  const { data } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", profile.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })

  return data ?? []
}

export async function getTeamAttendance(date?: string) {
  const profile = await requireAuth()
  const supabase = await createClient()
  const settings = await getOfficeSettings()
  const timezone = getSettingValue(settings, "timezone", "Asia/Karachi")
  const targetDate = date ?? getTodayInTimezone(timezone)

  let teamQuery = supabase.from("profiles").select("id, full_name, email, employee_id, department_id")

  if (profile.role === "manager") {
    teamQuery = teamQuery.eq("manager_id", profile.id)
  }

  const { data: team } = await teamQuery.eq("status", "active")

  if (!team?.length) return []

  const ids = team.map((t) => t.id)
  const { data: attendance } = await supabase
    .from("attendance")
    .select("*")
    .in("user_id", ids)
    .eq("date", targetDate)

  return team.map((member) => ({
    ...member,
    attendance: attendance?.find((a) => a.user_id === member.id) ?? null,
  }))
}

export async function getCompanyAttendance(date?: string, filters?: { status?: string }) {
  const profile = await requireAuth()
  if (!["admin", "hr"].includes(profile.role)) {
    return { error: "Forbidden" }
  }

  const supabase = await createClient()
  const settings = await getOfficeSettings()
  const timezone = getSettingValue(settings, "timezone", "Asia/Karachi")
  const targetDate = date ?? getTodayInTimezone(timezone)

  let query = supabase
    .from("attendance")
    .select("*")
    .eq("date", targetDate)

  if (filters?.status) {
    query = query.eq("status", filters.status as AttendanceStatus)
  }

  const { data } = await query.order("check_in", { ascending: false })
  if (!data?.length) return []

  const userIds = [...new Set(data.map((r) => r.user_id))]
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, employee_id")
    .in("id", userIds)

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? [])

  return data.map((record) => ({
    ...record,
    profile: profileMap.get(record.user_id) ?? null,
  }))
}
