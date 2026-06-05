"use client"

import { Bell, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { getRoleLabel, getRoleBadgeVariant } from "@/lib/auth/roles"
import type { UserRole } from "@/lib/auth/roles"
import { logoutAction } from "@/actions/auth"

interface DashboardNavbarProps {
  profile: {
    full_name: string | null
    email: string
    avatar_url: string | null
    role: UserRole
  }
  unreadAnnouncements?: number
  pendingLeave?: number
  unreadContactMessages?: number
  showContactInbox?: boolean
}

export function DashboardNavbar({
  profile,
  unreadAnnouncements = 0,
  pendingLeave = 0,
  unreadContactMessages = 0,
  showContactInbox = false,
}: DashboardNavbarProps) {
  const { theme, setTheme } = useTheme()
  const initials = (profile.full_name ?? profile.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const notificationCount = unreadAnnouncements + pendingLeave + unreadContactMessages
  const notificationHref = showContactInbox && unreadContactMessages > 0
    ? "/dashboard/messages"
    : "/dashboard/announcements"

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Button variant="ghost" size="icon" asChild className="relative">
          <Link href={notificationHref} aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ""} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">
                {profile.full_name ?? profile.email}
              </span>
              <Badge variant={getRoleBadgeVariant(profile.role)} className="hidden sm:inline-flex">
                {getRoleLabel(profile.role)}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <span>{profile.full_name}</span>
                <span className="text-xs font-normal text-muted-foreground">{profile.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => logoutAction()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
