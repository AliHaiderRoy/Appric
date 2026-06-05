"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { inviteEmployee } from "@/actions/auth"
import type { UserRole } from "@/lib/auth/roles"

const ROLE_HINTS: Record<UserRole, string> = {
  admin: "Full system — settings, audit logs, all modules",
  hr: "Employees, announcements, news, leave, departments",
  manager: "Team attendance, leave approvals, reports",
  employee: "Own profile, attendance, announcements, leave",
}

export default function NewEmployeePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [role, setRole] = useState<UserRole>("employee")

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await inviteEmployee({
        email: formData.get("email")?.toString() ?? "",
        fullName: formData.get("fullName")?.toString() ?? "",
        role,
        employeeId: formData.get("employeeId")?.toString() || null,
        designation: formData.get("designation")?.toString() || null,
      })
      if (result.error) toast.error(result.error)
      else {
        toast.success("Invitation sent")
        router.push("/dashboard/employees")
      }
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invite Employee</h1>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/employees">Cancel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input id="employeeId" name="employeeId" placeholder="EMP-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" name="designation" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-select">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger id="role-select" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{ROLE_HINTS[role]}</p>
              <p className="text-xs text-muted-foreground">
                The invitee will see this role on their signup page (read-only).
              </p>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invite
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
