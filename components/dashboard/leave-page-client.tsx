"use client"

import { useTransition } from "react"
import { Loader2, Check, X } from "lucide-react"
import { toast } from "sonner"
import { getLeaveRequests, applyLeave, updateLeaveStatus } from "@/actions/leave"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/dashboard/utils"
import type { LeaveRequestWithProfile } from "@/types/database.types"
import type { UserRole } from "@/lib/auth/roles"
import { useEffect, useState } from "react"

interface LeavePageClientProps {
  initialRequests: LeaveRequestWithProfile[]
  role: UserRole
}

export function LeavePageClient({ initialRequests, role }: LeavePageClientProps) {
  const [requests, setRequests] = useState(initialRequests)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setRequests(initialRequests)
  }, [initialRequests])

  const canApprove = ["admin", "hr", "manager"].includes(role)

  const handleApply = (formData: FormData) => {
    startTransition(async () => {
      const result = await applyLeave(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success("Leave request submitted")
        const updated = await getLeaveRequests()
        setRequests(updated)
      }
    })
  }

  const handleStatus = (id: string, status: "approved" | "rejected" | "cancelled") => {
    startTransition(async () => {
      const result = await updateLeaveStatus(id, status)
      if (result.error) toast.error(result.error)
      else {
        toast.success(`Leave ${status}`)
        const updated = await getLeaveRequests()
        setRequests(updated)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leave Management</h1>
        <p className="text-muted-foreground">Apply for leave or review team requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Apply for Leave</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleApply} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select name="leaveType" defaultValue="casual">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea id="reason" name="reason" required />
            </div>
            <Button type="submit" disabled={isPending} className="sm:col-span-2 w-fit">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {canApprove && <TableHead>Employee</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                {canApprove && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  {canApprove && (
                    <TableCell>{req.profile?.full_name ?? "—"}</TableCell>
                  )}
                  <TableCell>{req.leave_type}</TableCell>
                  <TableCell>
                    {formatDate(req.start_date)} – {formatDate(req.end_date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{req.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {req.status === "pending" && canApprove && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleStatus(req.id, "approved")} disabled={isPending}>
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleStatus(req.id, "rejected")} disabled={isPending}>
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                    {req.status === "pending" && !canApprove && (
                      <Button size="sm" variant="ghost" onClick={() => handleStatus(req.id, "cancelled")} disabled={isPending}>
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!requests.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No leave requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
