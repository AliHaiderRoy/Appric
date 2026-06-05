import { format, parseISO } from "date-fns"
import type { Json } from "@/types/database.types"

const DEFAULT_TIMEZONE = "Asia/Karachi"

export function getCompanyTimezone(settings?: Record<string, unknown>): string {
  const tz = settings?.timezone
  if (typeof tz === "string") return tz.replace(/"/g, "")
  return DEFAULT_TIMEZONE
}

export function getTodayInTimezone(timezone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

export function getTimeInTimezone(timezone = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date())
}

export function formatDate(date: string | Date, fmt = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, fmt)
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "MMM d, yyyy h:mm a")
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const ATTENDANCE_COLORS: Record<string, string> = {
  present: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  late: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  half_day: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
  absent: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  remote: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  on_leave: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
}

export function getSettingValue(
  settings: { key: string; value: Json }[],
  key: string,
  fallback: string
): string {
  const setting = settings.find((s) => s.key === key)
  if (!setting) return fallback
  const val = setting.value
  if (typeof val === "string") return val.replace(/"/g, "")
  if (typeof val === "number") return String(val)
  return fallback
}
