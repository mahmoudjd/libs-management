import { Response } from "express"

import type { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isAdmin } from "../lib/authorization"
import { parseObjectId } from "../lib/object-id"
import type { AuthenticatedRequest } from "../types/http"

/**
 * Permanent delete. Refuses while the user still has open obligations, because
 * removing them would orphan an active loan or a queued reservation.
 * Use the disable endpoint for the reversible case.
 */
export const deleteUserHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: "Only admins can delete users" })
  }

  const parsedUserId = parseObjectId(req.params.userId)
  if (!parsedUserId) {
    return res.status(400).json({ error: "Invalid user ID" })
  }

  if (req.user && parsedUserId.toHexString() === req.user.id) {
    return res.status(409).json({ error: "You cannot delete your own account" })
  }

  try {
    const existingUser = await appCtx.dbCtx.users.findOne({ _id: parsedUserId })
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" })
    }

    if (existingUser.role === "admin") {
      const adminCount = await appCtx.dbCtx.users.countDocuments({ role: "admin" })
      if (adminCount <= 1) {
        return res.status(409).json({ error: "At least one admin must remain" })
      }
    }

    const [activeLoanCount, pendingReservationCount] = await Promise.all([
      appCtx.dbCtx.loans.countDocuments({ userId: parsedUserId, returnedAt: null }),
      appCtx.dbCtx.reservations.countDocuments({ userId: parsedUserId, status: "pending" }),
    ])

    if (activeLoanCount > 0 || pendingReservationCount > 0) {
      return res.status(409).json({
        error:
          `User still has ${activeLoanCount} active loan(s) and ${pendingReservationCount} pending reservation(s). ` +
          "Settle those first, or disable the account instead.",
      })
    }

    await appCtx.dbCtx.users.deleteOne({ _id: parsedUserId })

    await writeAuditLog(appCtx, {
      action: "user.deleted",
      entityType: "user",
      entityId: parsedUserId.toHexString(),
      details: {
        email: existingUser.email,
        role: existingUser.role,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
      },
      actor: req.user,
    })

    return res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
