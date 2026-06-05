import { z } from "zod"

export const employeeSchema = z.object({
  email: z.string().email("Invalid email"),
  fullName: z.string().min(2, "Name is required"),
  role: z.enum(["admin", "hr", "manager", "employee"]).default("employee"),
  departmentId: z.string().uuid().optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
  employeeId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  joinDate: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "on_leave"]).default("active"),
})

export type EmployeeInput = z.infer<typeof employeeSchema>

export const leaveRequestSchema = z.object({
  leaveType: z.enum(["sick", "casual", "annual", "unpaid"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(5, "Reason is required"),
})

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>

export const departmentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional().nullable(),
  headId: z.string().uuid().optional().nullable(),
})

export type DepartmentInput = z.infer<typeof departmentSchema>

export const newsSchema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z.string().min(3, "Slug is required"),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(10, "Content is required"),
  category: z.enum(["general", "event", "policy", "achievement", "holiday"]).default("general"),
  coverImageUrl: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
})

export type NewsInput = z.infer<typeof newsSchema>

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
