import type { Request } from "express"

export function extractAccessTokenFromRequest(req: Request) {
  const authorizationHeader = req?.headers?.authorization
  if (
    !authorizationHeader ||
    authorizationHeader === "" ||
    authorizationHeader.trim() === "Bearer"
  ) {
    return null
  }
  const accessToken = authorizationHeader.replace("Bearer ", "")
  return accessToken
}
