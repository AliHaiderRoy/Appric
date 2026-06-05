"use client"

import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateOfficeSetting } from "@/actions/settings"
import type { OfficeSetting } from "@/types/database.types"

interface SettingsClientProps {
  settings: OfficeSetting[]
}

function getSetting(settings: OfficeSetting[], key: string, fallback: string): string {
  const s = settings.find((x) => x.key === key)
  if (!s) return fallback
  const val = s.value
  if (typeof val === "string") return val.replace(/"/g, "")
  if (typeof val === "number") return String(val)
  return fallback
}

export function SettingsClient({ settings }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const keys = ["work_start_time", "work_end_time", "late_threshold_minutes", "timezone", "company_name"]
      for (const key of keys) {
        const value = formData.get(key)?.toString()
        if (value) {
          const result = await updateOfficeSetting(key, JSON.parse(JSON.stringify(value)))
          if (result.error) {
            toast.error(result.error)
            return
          }
        }
      }
      toast.success("Settings updated")
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Office Settings</h1>
        <p className="text-muted-foreground">Configure office timings and company info</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="grid gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input id="company_name" name="company_name" defaultValue={getSetting(settings, "company_name", "APPRIC Software House")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="work_start_time">Work Start Time</Label>
              <Input id="work_start_time" name="work_start_time" type="time" defaultValue={getSetting(settings, "work_start_time", "09:00")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="work_end_time">Work End Time</Label>
              <Input id="work_end_time" name="work_end_time" type="time" defaultValue={getSetting(settings, "work_end_time", "18:00")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="late_threshold_minutes">Late Threshold (minutes)</Label>
              <Input id="late_threshold_minutes" name="late_threshold_minutes" type="number" defaultValue={getSetting(settings, "late_threshold_minutes", "15")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" name="timezone" defaultValue={getSetting(settings, "timezone", "Asia/Karachi")} />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
