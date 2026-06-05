"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getRoleLabel, getRoleBadgeVariant } from "@/lib/auth/roles"
import type { UserRole } from "@/lib/auth/roles"
import { formatDate } from "@/lib/dashboard/utils"

interface EmployeeRow {
  id: string
  full_name: string | null
  email: string
  role: UserRole
  employee_id: string | null
  status: string
  join_date: string | null
  department_id?: string | null
}

interface EmployeeTableProps {
  employees: EmployeeRow[]
  showActions?: boolean
}

export function EmployeeTable({ employees, showActions = true }: EmployeeTableProps) {
  if (!employees.length) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        No employees found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Employee ID</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Join Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((emp) => (
          <TableRow key={emp.id}>
            <TableCell>
              {showActions ? (
                <Link href={`/dashboard/employees/${emp.id}`} className="font-medium hover:underline">
                  {emp.full_name ?? emp.email}
                </Link>
              ) : (
                emp.full_name ?? emp.email
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">{emp.employee_id ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{emp.department_id?.slice(0, 8) ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={getRoleBadgeVariant(emp.role)}>{getRoleLabel(emp.role)}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={emp.status === "active" ? "outline" : "secondary"}>{emp.status}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {emp.join_date ? formatDate(emp.join_date) : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
