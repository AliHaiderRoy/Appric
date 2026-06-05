import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/types/database.types"
import type { UserRole } from "@/lib/auth/roles"

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return data
}

export async function requireAuth() {
  const profile = await getProfile()
  if (!profile) {
    throw new Error("Unauthorized")
  }
  return profile
}

export async function requireRole(minRole: UserRole) {
  const profile = await requireAuth()
  const { hasMinimumRole } = await import("@/lib/auth/roles")
  if (!hasMinimumRole(profile.role, minRole)) {
    throw new Error("Forbidden")
  }
  return profile
}
