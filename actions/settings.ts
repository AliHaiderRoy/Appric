"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/session"
import type { Json } from "@/types/database.types"

export async function getOfficeSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from("office_settings").select("*")
  return data ?? []
}

export async function updateOfficeSetting(key: string, value: Json) {
  const profile = await requireRole("admin")
  const supabase = await createClient()

  const { error } = await supabase.from("office_settings").upsert({
    key,
    value,
    updated_by: profile.id,
  })

  if (error) return { error: error.message }

  await supabase.from("audit_logs").insert({
    user_id: profile.id,
    action: "update_setting",
    entity_type: "office_settings",
    entity_id: key,
    metadata: { value } as Json,
  })

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function getAuditLogs(limit = 20) {
  await requireRole("admin")
  const supabase = await createClient()

  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)

  return data ?? []
}
