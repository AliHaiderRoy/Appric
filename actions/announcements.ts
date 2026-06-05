"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireAuth, requireRole } from "@/lib/auth/session"
import { announcementSchema } from "@/lib/validations/announcement"

export async function getAnnouncements() {
  const profile = await requireAuth()
  const supabase = await createClient()

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  const { data: reads } = await supabase
    .from("announcement_reads")
    .select("announcement_id")
    .eq("user_id", profile.id)

  const readIds = new Set(reads?.map((r) => r.announcement_id) ?? [])

  return (announcements ?? []).map((a) => ({
    ...a,
    is_read: readIds.has(a.id),
  }))
}

export async function getAnnouncement(id: string) {
  await requireAuth()
  const supabase = await createClient()

  const { data } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .single()

  return data
}

export async function markAnnouncementRead(announcementId: string) {
  const profile = await requireAuth()
  const supabase = await createClient()

  await supabase.from("announcement_reads").upsert({
    announcement_id: announcementId,
    user_id: profile.id,
  })

  revalidatePath("/dashboard/announcements")
  return { success: true }
}

export async function createAnnouncement(formData: FormData) {
  await requireRole("hr")
  const profile = await requireAuth()

  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    priority: formData.get("priority") || "normal",
    targetAudience: formData.get("targetAudience") || "all",
    targetDepartmentId: formData.get("targetDepartmentId") || null,
    targetRole: formData.get("targetRole") || null,
    isPinned: formData.get("isPinned") === "true",
    isPublished: formData.get("isPublished") === "true",
    publishAt: formData.get("publishAt") || null,
    expiresAt: formData.get("expiresAt") || null,
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("announcements").insert({
    title: parsed.data.title,
    content: parsed.data.content,
    priority: parsed.data.priority,
    target_audience: parsed.data.targetAudience,
    target_department_id: parsed.data.targetDepartmentId ?? null,
    target_role: parsed.data.targetRole ?? null,
    published_by: profile.id,
    is_pinned: parsed.data.isPinned,
    is_published: parsed.data.isPublished,
    publish_at: parsed.data.publishAt ?? null,
    expires_at: parsed.data.expiresAt ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath("/dashboard/announcements")
  return { success: true }
}

export async function getUnreadAnnouncementCount() {
  const profile = await requireAuth()
  const supabase = await createClient()

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id")
    .eq("is_published", true)

  const { data: reads } = await supabase
    .from("announcement_reads")
    .select("announcement_id")
    .eq("user_id", profile.id)

  const readIds = new Set(reads?.map((r) => r.announcement_id) ?? [])
  return announcements?.filter((a) => !readIds.has(a.id)).length ?? 0
}
