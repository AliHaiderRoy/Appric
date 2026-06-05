"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types/database.types"

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isPending, startTransition] = useTransition()

  const refresh = useCallback(() => {
    startTransition(async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setProfile(null)
        return
      }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(data)
    })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { profile, isPending, refresh }
}
