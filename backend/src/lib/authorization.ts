import type { AuthenticatedRequest, AuthenticatedUser } from "../types/http"

export function isAdmin(user: AuthenticatedUser | undefined) {
  return user?.role === "admin"
}

export function isStaff(user: AuthenticatedUser | undefined) {
  return user?.role === "admin" || user?.role === "librarian"
}

export function ensureAuthenticated(req: AuthenticatedRequest) {
  return req.user !== undefined
}
