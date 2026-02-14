import type { NextFunction, Response } from "express"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

import { extractAccessTokenFromRequest } from "../api/lib/extract-access-token-from-request"
import type { AppContext } from "../context/app-ctx"
import type { AuthenticatedRequest, AuthenticatedUser } from "../types/http"
import type { UserRole } from "../types/types"

interface AccessTokenPayload {
  userId: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
}

function isAccessTokenPayload(value: unknown): value is AccessTokenPayload {
  if (!value || typeof value !== "object") {
    return false
  }

  const payload = value as Record<string, unknown>
  return (
    typeof payload.userId === "string" &&
    typeof payload.firstName === "string" &&
    typeof payload.lastName === "string" &&
    typeof payload.email === "string" &&
    (payload.role === "admin" || payload.role === "librarian" || payload.role === "user")
  )
}

export const authentication =
  (ctx: AppContext) =>
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const accessToken = extractAccessTokenFromRequest(req)
      if (!accessToken) {
        return res.status(401).json({ error: "Missing token in Authorization header" })
      }

      let decodedToken: unknown
      try {
        decodedToken = jwt.verify(accessToken, ctx.config.auth.secret)
      } catch {
        return res.status(401).json({ error: "Invalid token" })
      }

      if (!isAccessTokenPayload(decodedToken) || !ObjectId.isValid(decodedToken.userId)) {
        return res.status(401).json({ error: "Invalid token payload" })
      }

      try {
        const user = await ctx.dbCtx.users.findOne(
          { _id: new ObjectId(decodedToken.userId) },
          { projection: { firstName: 1, lastName: 1, email: 1, role: 1 } }
        )

        if (!user) {
          return res.status(401).json({ error: "Invalid token: user not found" })
        }

        const role: AuthenticatedUser["role"] = user.role === "admin" || user.role === "librarian"
          ? user.role
          : "user"
        req.user = {
          id: user._id.toHexString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role
        }

        return next()
      } catch (error) {
        console.error("❌ Authentication error:", error)
        return res.status(401).json({ error: "Invalid token" })
      }
    }
