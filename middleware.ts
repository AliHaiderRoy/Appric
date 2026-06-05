import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { canAccessRoute } from "@/lib/auth/roles"
import type { UserRole } from "@/lib/auth/roles"

const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/forgot-password"]
const PROTECTED_PREFIX = "/dashboard"

export async function middleware(request: NextRequest) {
  const { supabase, user, supabaseResponse } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))
  const isProtected = pathname.startsWith(PROTECTED_PREFIX)
  const isCallback = pathname.startsWith("/auth/callback")

  if (isCallback) {
    return supabaseResponse
  }

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user && !pathname.startsWith("/auth/register")) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  if (isProtected && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role as UserRole | undefined

    if (!canAccessRoute(role, pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/callback",
    "/auth/invite/:path*",
  ],
}
