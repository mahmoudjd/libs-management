import type { Request } from "express"

import type { UserRole } from "./types"

export interface AuthenticatedUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
}

// ponytail: pins req.params back to plain strings; @types/express-serve-static-core@5.1.3
// widened ParamsDictionary to string | string[] for path-to-regexp v8 repeat-params,
// which none of our routes use. Revisit if a route ever adds a :name+ / *wildcard param.
export type AuthenticatedRequest = Request<Record<string, string>> & {
  user?: AuthenticatedUser
}

export function canAccessUserResource(req: AuthenticatedRequest, userId: string) {
  return req.user?.role === "admin" || req.user?.id === userId
}
