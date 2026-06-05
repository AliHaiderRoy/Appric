"use client"

import { Toaster } from "@/components/ui/sonner"

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors closeButton />
    </>
  )
}
