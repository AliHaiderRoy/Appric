"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/session"

export type ContactMessageStatus = "new" | "read" | "replied" | "archived"

export interface ContactMessage {
  id: string
  name: string
  email: string
  company: string | null
  message: string
  status: ContactMessageStatus
  admin_reply: string | null
  replied_by: string | null
  read_by: string | null
  read_at: string | null
  replied_at: string | null
  created_at: string
}

function normalize(row: Record<string, unknown>): ContactMessage {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    company: row.company ? String(row.company) : null,
    message: String(row.message),
    status: row.status as ContactMessageStatus,
    admin_reply: row.admin_reply ? String(row.admin_reply) : null,
    replied_by: row.replied_by ? String(row.replied_by) : null,
    read_by: row.read_by ? String(row.read_by) : null,
    read_at: row.read_at ? String(row.read_at) : null,
    replied_at: row.replied_at ? String(row.replied_at) : null,
    created_at: String(row.created_at),
  }
}

export async function getContactMessages() {
  await requireRole("hr")
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(normalize)
}

export async function getUnreadContactMessageCount() {
  try {
    await requireRole("hr")
  } catch {
    return 0
  }

  const supabase = await createClient()
  const { count, error } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("status", "new")

  if (error) return 0
  return count ?? 0
}

export async function markContactMessageRead(id: string) {
  const profile = await requireRole("hr")
  const supabase = await createClient()

  const { error } = await supabase
    .from("contact_messages")
    .update({
      status: "read",
      read_by: profile.id,
      read_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "new")

  if (error) return { error: error.message }

  revalidatePath("/dashboard/messages")
  return { success: true }
}

export async function replyToContactMessage(id: string, adminReply: string) {
  const profile = await requireRole("hr")
  const supabase = await createClient()

  if (!adminReply.trim()) return { error: "Reply cannot be empty" }

  const { error } = await supabase
    .from("contact_messages")
    .update({
      status: "replied",
      admin_reply: adminReply.trim(),
      replied_by: profile.id,
      replied_at: new Date().toISOString(),
      read_by: profile.id,
      read_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/messages")
  return { success: true }
}

export async function updateContactMessageStatus(id: string, status: ContactMessageStatus) {
  await requireRole("hr")
  const supabase = await createClient()

  const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/messages")
  return { success: true }
}

export async function deleteContactMessage(id: string) {
  await requireRole("admin")
  const supabase = await createClient()

  const { error } = await supabase.from("contact_messages").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/messages")
  return { success: true }
}
