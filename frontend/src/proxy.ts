import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

type Role = "admin" | "librarian" | "user"

/**
 * Access is decided here rather than in each page, so a protected route never
 * renders before the client has worked out who is signed in.
 */
const ROUTE_RULES: Array<{ prefix: string; roles?: Role[] }> = [
  { prefix: "/dashboard" },
  { prefix: "/loans" },
  { prefix: "/profile" },
  { prefix: "/reservations", roles: ["admin", "librarian"] },
  { prefix: "/users", roles: ["admin"] },
  { prefix: "/audit-logs", roles: ["admin"] },
]

const AUTH_ROUTES = new Set(["/login", "/signup"])

function matchRule(pathname: string) {
  return ROUTE_RULES.find(
    (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
  )
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = Boolean(token)
  const role = (token?.role as Role | undefined) ?? "user"

  if (pathname === "/") {
    return NextResponse.redirect(new URL(isLoggedIn ? "/dashboard" : "/books", req.url))
  }

  // Signing in again while already signed in just loops back to the app.
  if (AUTH_ROUTES.has(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  const rule = matchRule(pathname)
  if (!rule) {
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    // Bring the user back to where they were headed once they are in.
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (rule.roles && !rule.roles.includes(role)) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/loans/:path*",
    "/profile/:path*",
    "/reservations/:path*",
    "/users/:path*",
    "/audit-logs/:path*",
  ],
}
