"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"
import { AVATAR_UPDATED_EVENT } from "@/lib/events"

export function HeaderAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const loadProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", userId)
        .single()
      setAvatarUrl(data?.avatar_url ?? null)
    }

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      if (u) loadProfile(u.id)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) loadProfile(u.id)
      else setAvatarUrl(null)
    })

    const onAvatarUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ url: string | null }>).detail
      if (detail?.url !== undefined) setAvatarUrl(detail.url)
    }

    window.addEventListener(AVATAR_UPDATED_EVENT, onAvatarUpdated)
    return () => {
      subscription.unsubscribe()
      window.removeEventListener(AVATAR_UPDATED_EVENT, onAvatarUpdated)
    }
  }, [])

  if (loading) return null

  if (user) {
    const initials = (user.user_metadata?.full_name ?? user.email ?? "U")
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    return (
      <Link href="/dashboard" className="flex items-center gap-2">
        <Button
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
        >
          Dashboard
        </Button>
        <Avatar className="h-8 w-8 border border-white/20">
          <AvatarImage src={avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="text-xs bg-blue-600 text-white">{initials}</AvatarFallback>
        </Avatar>
      </Link>
    )
  }

  return (
    <Link href="/auth/login">
      <Button
        size="sm"
        variant="outline"
        className="border-blue-400/50 text-blue-300 hover:bg-blue-500/10 hover:text-white bg-transparent"
      >
        Login
      </Button>
    </Link>
  )
}
