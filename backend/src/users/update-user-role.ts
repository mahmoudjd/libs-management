import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isAdmin } from "../lib/authorization"
import { parseObjectId } from "../lib/object-id"
import { UserRoleSchema } from "../types/types"
import type { AuthenticatedRequest } from "../types/http"

export const updateUserRoleHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: "Only admins can update roles" })
  }

  const userId = req.params.userId
  const parsedUserId = parseObjectId(userId)

  if (!parsedUserId) {
    return res.status(400).json({ error: "Invalid user ID" })
  }

  const parseRoleResult = UserRoleSchema.safeParse(req.body?.role)
  if (!parseRoleResult.success) {
    return res.status(400).json({ error: "Invalid role" })
  }

  const nextRole = parseRoleResult.data

  try {
    const existingUser = await appCtx.dbCtx.users.findOne({ _id: parsedUserId })
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" })
    }

    if (existingUser.role === nextRole) {
      return res.status(200).json({ message: "Role unchanged" })
    }

    if (existingUser.role === "admin" && nextRole !== "admin") {
      const adminCount = await appCtx.dbCtx.users.countDocuments({ role: "admin" })
      if (adminCount <= 1) {
        return res.status(409).json({ error: "At least one admin must remain" })
      }
    }

    await appCtx.dbCtx.users.updateOne(
      { _id: parsedUserId },
      { $set: { role: nextRole } }
    )

    await writeAuditLog(appCtx, {
      action: "user.role.updated",
      entityType: "user",
      entityId: parsedUserId.toHexString(),
      details: {
        previousRole: existingUser.role,
        nextRole,
      },
      actor: req.user,
    })

    return res.status(200).json({
      message: "Role updated successfully",
      role: nextRole,
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
