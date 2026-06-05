"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { loginSchema, forgotPasswordSchema } from "@/lib/validations/auth"

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: error.message }
  }

  const redirectTo = formData.get("redirect")?.toString() || "/dashboard"
  redirect(redirectTo)
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function forgotPasswordAction(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/dashboard/profile`,
  })

  if (error) return { error: error.message }
  return { success: "Check your email for a password reset link" }
}

export async function inviteEmployee(data: {
  email: string
  fullName: string
  role: string
  departmentId?: string | null
  managerId?: string | null
  employeeId?: string | null
  designation?: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "hr"].includes(profile.role)) {
    return { error: "Forbidden" }
  }

  const admin = createAdminClient()
  const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(data.email, {
    data: { full_name: data.fullName },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/auth/register`,
  })

  if (error) return { error: error.message }

  if (invited.user) {
    await admin.from("profiles").update({
      full_name: data.fullName,
      role: data.role as "admin" | "hr" | "manager" | "employee",
      department_id: data.departmentId ?? null,
      manager_id: data.managerId ?? null,
      employee_id: data.employeeId ?? null,
      designation: data.designation ?? null,
    }).eq("id", invited.user.id)
  }

  revalidatePath("/dashboard/employees")
  return { success: true }
}
