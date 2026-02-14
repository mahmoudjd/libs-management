import type { Request } from "express"

export function extractAccessTokenFromRequest(req: Request) {
  const authorizationHeader = req.headers.authorization
  if (!authorizationHeader || authorizationHeader.trim() === "") {
    return null
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/)
  if (scheme !== "Bearer" || !token) {
    return null
  }

  return token
}
