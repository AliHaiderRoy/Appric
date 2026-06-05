import { z } from "zod"

export const announcementSchema = z.object({
  title: z.string().min(3, "Title is required"),
  content: z.string().min(10, "Content is required"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  targetAudience: z.enum(["all", "department", "role", "specific_users"]).default("all"),
  targetDepartmentId: z.string().uuid().optional().nullable(),
  targetRole: z.enum(["admin", "hr", "manager", "employee"]).optional().nullable(),
  isPinned: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  publishAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
})

export type AnnouncementInput = z.infer<typeof announcementSchema>
