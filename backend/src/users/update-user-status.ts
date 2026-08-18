import { Response } from "express"

import type { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isAdmin } from "../lib/authorization"
import { parseObjectId } from "../lib/object-id"
import type { AuthenticatedRequest } from "../types/http"

/**
 * Disables or re-enables an account. Disabling blocks login but keeps the user
 * and their loan history intact, so it is the reversible alternative to delete.
 */
export const updateUserStatusHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: "Only admins can change account status" })
  }

  const parsedUserId = parseObjectId(req.params.userId)
  if (!parsedUserId) {
    return res.status(400).json({ error: "Invalid user ID" })
  }

  const disabled = req.body?.disabled
  if (typeof disabled !== "boolean") {
    return res.status(400).json({ error: "disabled must be a boolean" })
  }

  if (disabled && req.user && parsedUserId.toHexString() === req.user.id) {
    return res.status(409).json({ error: "You cannot disable your own account" })
  }

  try {
    const existingUser = await appCtx.dbCtx.users.findOne({ _id: parsedUserId })
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" })
    }

    if ((existingUser.disabled ?? false) === disabled) {
      return res.status(200).json({ message: "Account status unchanged", disabled })
    }

    // Locking out the last admin would leave nobody able to unlock anything.
    if (disabled && existingUser.role === "admin") {
      const activeAdminCount = await appCtx.dbCtx.users.countDocuments({
        role: "admin",
        disabled: { $ne: true },
      })
      if (activeAdminCount <= 1) {
        return res.status(409).json({ error: "At least one active admin must remain" })
      }
    }

    await appCtx.dbCtx.users.updateOne({ _id: parsedUserId }, { $set: { disabled } })

    await writeAuditLog(appCtx, {
      action: disabled ? "user.disabled" : "user.enabled",
      entityType: "user",
      entityId: parsedUserId.toHexString(),
      details: { email: existingUser.email, role: existingUser.role },
      actor: req.user,
    })

    return res.status(200).json({
      message: disabled ? "Account disabled" : "Account enabled",
      disabled,
    })
  } catch (error) {
    console.error("Error updating account status:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
