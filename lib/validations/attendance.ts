import { z } from "zod"

export const checkInSchema = z.object({
  workMode: z.enum(["office", "remote", "hybrid"]).default("office"),
  notes: z.string().optional(),
})

export const checkOutSchema = z.object({
  notes: z.string().optional(),
})

export type CheckInInput = z.infer<typeof checkInSchema>
export type CheckOutInput = z.infer<typeof checkOutSchema>
