import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckInButton } from "./check-in-button"
import type { Attendance } from "@/types/database.types"
import { ATTENDANCE_COLORS } from "@/lib/dashboard/utils"

interface AttendanceWidgetProps {
  todayRecord: Attendance | null
}

export function AttendanceWidget({ todayRecord }: AttendanceWidgetProps) {
  const status = todayRecord?.status ?? "absent"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Today&apos;s Attendance</CardTitle>
        <Badge variant="outline" className={ATTENDANCE_COLORS[status]}>
          {status.replace("_", " ")}
        </Badge>
      </CardHeader>
      <CardContent>
        <CheckInButton todayRecord={todayRecord} />
        <Link
          href="/dashboard/attendance"
          className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          View attendance history →
        </Link>
      </CardContent>
    </Card>
  )
}
