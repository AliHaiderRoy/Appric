#!/usr/bin/env node
/**
 * Bootstrap first admin user for APPRIC Office Dashboard
 * Usage: node scripts/bootstrap-admin.js admin@appric.com "SecurePassword123" "Admin User"
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env
 */

const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env")
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, "utf8")
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    let val = trimmed.slice(eq + 1)
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.argv[2]
const password = process.argv[3]
const fullName = process.argv[4] || "System Admin"

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
  process.exit(1)
}

if (!email || !password) {
  console.error('Usage: node scripts/bootstrap-admin.js <email> <password> ["Full Name"]')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find((u) => u.email === email)

  let userId = found?.id

  if (!found) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error) {
      console.error("Failed to create user:", error.message)
      process.exit(1)
    }
    userId = data.user.id
    console.log("Created auth user:", email)
  } else {
    console.log("User already exists:", email)
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      role: "admin",
      employee_id: "EMP-ADMIN",
      designation: "System Administrator",
      status: "active",
    })
    .eq("id", userId)

  if (profileError) {
    console.error("Failed to update profile:", profileError.message)
    process.exit(1)
  }

  console.log("Admin profile configured. Login at /auth/login")
}

main()
