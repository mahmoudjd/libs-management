import type { Request } from "express"

import type { UserRole } from "./types"

export interface AuthenticatedUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
}

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser
}

export function canAccessUserResource(req: AuthenticatedRequest, userId: string) {
  return req.user?.role === "admin" || req.user?.id === userId
}
