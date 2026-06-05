"use client"

import { useTransition } from "react"
import { LogIn, LogOut, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { checkIn, checkOut } from "@/actions/attendance"
import type { Attendance } from "@/types/database.types"
import { formatDateTime } from "@/lib/dashboard/utils"

interface CheckInButtonProps {
  todayRecord: Attendance | null
}

export function CheckInButton({ todayRecord }: CheckInButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleCheckIn = (workMode: "office" | "remote" | "hybrid") => {
    startTransition(async () => {
      const result = await checkIn(workMode)
      if (result.error) toast.error(result.error)
      else toast.success("Checked in successfully")
    })
  }

  const handleCheckOut = () => {
    startTransition(async () => {
      const result = await checkOut()
      if (result.error) toast.error(result.error)
      else toast.success("Checked out successfully")
    })
  }

  const checkedIn = !!todayRecord?.check_in
  const checkedOut = !!todayRecord?.check_out

  return (
    <div className="flex flex-col gap-3">
      {todayRecord?.check_in && (
        <p className="text-sm text-muted-foreground">
          Check-in: {formatDateTime(todayRecord.check_in)}
        </p>
      )}
      {todayRecord?.check_out && (
        <p className="text-sm text-muted-foreground">
          Check-out: {formatDateTime(todayRecord.check_out)}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!checkedIn && (
          <>
            <Button
              onClick={() => handleCheckIn("office")}
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Check In (Office)
            </Button>
            <Select onValueChange={(v) => handleCheckIn(v as "remote" | "hybrid")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Remote/Hybrid" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
        {checkedIn && !checkedOut && (
          <Button
            variant="outline"
            onClick={handleCheckOut}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Check Out
          </Button>
        )}
        {checkedOut && (
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Day complete — {todayRecord?.total_hours ?? 0}h logged
          </p>
        )}
      </div>
    </div>
  )
}
