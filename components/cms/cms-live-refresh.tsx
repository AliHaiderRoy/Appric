"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const CMS_TABLES = [
  "site_settings",
  "site_services",
  "site_portfolio",
  "site_blog_posts",
  "site_team_members",
  "site_client_logos",
] as const

/**
 * Subscribes to Supabase Realtime CMS changes and refreshes the page
 * so public visitors see admin updates without a manual reload.
 */
export function CmsLiveRefresh() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const refresh = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => router.refresh(), 300)
    }

    const channel = supabase.channel("cms-live-updates")

    for (const table of CMS_TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        refresh
      )
    }

    channel.subscribe()

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
