import { Response } from "express"
import type { ObjectId } from "mongodb"

import { AppContext } from "../context/app-ctx"
import { parseObjectId } from "../lib/object-id"
import { canAccessUserResource, type AuthenticatedRequest } from "../types/http"

export const getLoansByUserIdHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (!canAccessUserResource(req, userId)) {
    return res.status(403).json({ message: "Forbidden" })
  }

  const parsedUserId = parseObjectId(userId)
  if (!parsedUserId) {
    return res.status(400).json({ message: "Invalid user ID" })
  }

  try {
    const userLoans = await getUserLoans(appCtx, parsedUserId)
    return res.status(200).json(userLoans)
  } catch {
    return res.status(500).json({ message: "Internal server error" })
  }
}

const getUserLoans = async (appCtx: AppContext, userId: ObjectId) => {
  const cursor = appCtx.dbCtx.loans.find({ userId })
  return cursor.toArray()
}
