import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = body.name?.toString()?.trim()
    const email = body.email?.toString()?.trim()
    const company = body.company?.toString()?.trim() || null
    const message = body.message?.toString()?.trim()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      company,
      message,
      status: "new",
    })

    if (error) {
      console.error("[contact] Insert failed:", error.message)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: "Contact form submitted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[contact] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
