"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { getAnnouncements, getUnreadAnnouncementCount } from "@/actions/announcements"
import type { AnnouncementWithAuthor } from "@/types/database.types"

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isPending, startTransition] = useTransition()

  const refresh = useCallback(() => {
    startTransition(async () => {
      const [items, count] = await Promise.all([
        getAnnouncements(),
        getUnreadAnnouncementCount(),
      ])
      setAnnouncements(items)
      setUnreadCount(count)
    })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { announcements, unreadCount, isPending, refresh }
}
