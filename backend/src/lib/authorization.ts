import type { AuthenticatedUser } from "../types/http"

export function isAdmin(user: AuthenticatedUser | undefined) {
  return user?.role === "admin"
}

export function isStaff(user: AuthenticatedUser | undefined) {
  return user?.role === "admin" || user?.role === "librarian"
}
