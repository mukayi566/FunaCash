import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Debug: Log all cookies
  console.log("Middleware checking auth, cookies:", request.cookies.getAll())

  // More lenient authentication check
  const isAuthenticated = request.cookies.has("user_authenticated") || request.cookies.has("user_id") // Consider authenticated if user_id exists

  const userRole = request.cookies.get("user_role")?.value || "customer" // Default to customer if not set
  const userId = request.cookies.get("user_id")?.value

  console.log("Auth check:", { isAuthenticated, userRole, userId, pathname })

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/required",
    "/how-it-works",
    "/fees",
  ]
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // Auth routes that should redirect to dashboard if already authenticated
  const authRoutes = ["/auth/login", "/auth/signup", "/auth/forgot-password"]
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // Customer dashboard routes
  const isCustomerDashboardRoute = pathname.startsWith("/dashboard/customer")

  // Agent dashboard routes
  const isAgentDashboardRoute = pathname.startsWith("/dashboard/agent")

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    const redirectUrl = userRole === "agent" ? "/dashboard/agent" : "/dashboard/customer"
    console.log("Redirecting authenticated user from auth route to:", redirectUrl)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // If user is not authenticated and trying to access protected routes, redirect to auth required page
  if (!isAuthenticated && !isPublicRoute) {
    console.log("Redirecting unauthenticated user to auth required page")
    const returnTo = encodeURIComponent(pathname)
    return NextResponse.redirect(new URL(`/auth/required?returnTo=${returnTo}`, request.url))
  }

  // If user is authenticated but trying to access the wrong dashboard
  if (isAuthenticated && userRole) {
    if (userRole === "customer" && isAgentDashboardRoute) {
      console.log("Customer trying to access agent dashboard, redirecting")
      return NextResponse.redirect(new URL("/dashboard/customer", request.url))
    }

    if (userRole === "agent" && isCustomerDashboardRoute) {
      console.log("Agent trying to access customer dashboard, redirecting")
      return NextResponse.redirect(new URL("/dashboard/agent", request.url))
    }
  }

  console.log("Middleware allowing access to:", pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
