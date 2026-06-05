"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { getTodayAttendance, checkIn, checkOut } from "@/actions/attendance"
import type { Attendance } from "@/types/database.types"

export function useAttendance() {
  const [record, setRecord] = useState<Attendance | null>(null)
  const [isPending, startTransition] = useTransition()

  const refresh = useCallback(() => {
    startTransition(async () => {
      const data = await getTodayAttendance()
      setRecord(data)
    })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const doCheckIn = (workMode: "office" | "remote" | "hybrid" = "office") => {
    startTransition(async () => {
      await checkIn(workMode)
      refresh()
    })
  }

  const doCheckOut = () => {
    startTransition(async () => {
      await checkOut()
      refresh()
    })
  }

  return { record, isPending, refresh, doCheckIn, doCheckOut }
}
