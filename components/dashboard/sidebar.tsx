"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Clock,
  Megaphone,
  Newspaper,
  Users,
  CalendarDays,
  Building2,
  BarChart3,
  Settings,
  Shield,
  UserCircle,
  Globe,
  Inbox,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { UserRole } from "@/lib/auth/roles"
import { hasMinimumRole } from "@/lib/auth/roles"

const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["employee"] as UserRole[] },
  { title: "Attendance", href: "/dashboard/attendance", icon: Clock, roles: ["employee"] as UserRole[] },
  { title: "Announcements", href: "/dashboard/announcements", icon: Megaphone, roles: ["employee"] as UserRole[] },
  { title: "News", href: "/dashboard/news", icon: Newspaper, roles: ["employee"] as UserRole[] },
  { title: "Leave", href: "/dashboard/leave", icon: CalendarDays, roles: ["employee"] as UserRole[] },
  { title: "Profile", href: "/dashboard/profile", icon: UserCircle, roles: ["employee"] as UserRole[] },
  { title: "Employees", href: "/dashboard/employees", icon: Users, minRole: "manager" as UserRole },
  { title: "Departments", href: "/dashboard/departments", icon: Building2, minRole: "hr" as UserRole },
  { title: "Reports", href: "/dashboard/reports", icon: BarChart3, minRole: "manager" as UserRole },
  { title: "Contact Inbox", href: "/dashboard/messages", icon: Inbox, minRole: "hr" as UserRole },
  { title: "Website CMS", href: "/dashboard/cms", icon: Globe, minRole: "admin" as UserRole },
  { title: "Settings", href: "/dashboard/settings", icon: Settings, minRole: "admin" as UserRole },
  { title: "Admin", href: "/dashboard/admin", icon: Shield, minRole: "admin" as UserRole },
]

interface DashboardSidebarProps {
  role: UserRole
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname()

  const visibleItems = navItems.filter((item) => {
    if (item.minRole) return hasMinimumRole(role, item.minRole)
    return true
  })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            A
          </div>
          <span className="group-data-[collapsible=icon]:hidden">APPRIC Office</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:hidden"
        >
          ← Back to website
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
