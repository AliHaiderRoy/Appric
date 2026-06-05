"use client"

import { Suspense, useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, Mail, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { getRoleLabel, getRoleBadgeVariant } from "@/lib/auth/roles"
import type { UserRole } from "@/lib/auth/roles"

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full system access — users, departments, settings, audit logs",
  hr: "Employees, attendance reports, announcements, news, leave approval",
  manager: "Team attendance, leave approvals, team reports",
  employee: "Own profile, check-in/out, announcements, news, leave requests",
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [fullName, setFullName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [assignedRole, setAssignedRole] = useState<UserRole>("employee")

  useEffect(() => {
    const initSession = async () => {
      const supabase = createClient()

      // Handle ?token_hash=&type=invite from Supabase email links
      const tokenHash = searchParams.get("token_hash")
      const type = searchParams.get("type")
      if (tokenHash && type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "invite" | "email" | "signup" | "recovery",
        })
        if (verifyError) {
          setError(verifyError.message)
        }
      }

      // Handle #access_token= in URL hash (implicit / invite redirect)
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = new URLSearchParams(window.location.hash.slice(1))
        const accessToken = hash.get("access_token")
        const refreshToken = hash.get("refresh_token")
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          window.history.replaceState(null, "", window.location.pathname)
        }
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setHasSession(false)
        setLoadingProfile(false)
        return
      }

      setHasSession(true)
      setEmail(user.email ?? null)

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()

      if (profile?.full_name) setFullName(profile.full_name)
      if (profile?.role) setAssignedRole(profile.role as UserRole)
      setLoadingProfile(false)
    }

    initSession()
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const password = form.get("password")?.toString() ?? ""
    const confirm = form.get("confirmPassword")?.toString() ?? ""

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match")
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setHasSession(false)
        setError("Session expired. Open the link from your invite email again.")
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }

      router.push("/dashboard")
      router.refresh()
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Signup</CardTitle>
          <CardDescription>
            Set your password to activate your APPRIC Office account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingProfile ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Checking invite session…</p>
            </div>
          ) : !hasSession ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">No active invite session</p>
                <p className="text-sm text-muted-foreground">
                  This page only works after you open the <strong>invite link</strong> sent to your
                  email by Admin/HR. Do not open this URL directly.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3 text-left text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Already have a password?</p>
                <p>
                  If your account was created by an admin (e.g. bootstrap script), use{" "}
                  <strong>Login</strong> instead — you do not need this page.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Go to Login
                </Link>
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {(fullName || email) && (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  {fullName && <p className="font-medium">{fullName}</p>}
                  {email && <p className="text-muted-foreground">{email}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">Your assigned role</Label>
                <Select value={assignedRole} disabled>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(assignedRole)}>
                    {getRoleLabel(assignedRole)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Assigned by Admin/HR
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {ROLE_DESCRIPTIONS[assignedRole]}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" minLength={8} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Activate Account
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already have a password?{" "}
            <Link href="/auth/login" className="underline hover:text-foreground">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
