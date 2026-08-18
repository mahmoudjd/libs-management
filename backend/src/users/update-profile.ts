import { Response } from "express"
import { ObjectId } from "mongodb"

import type { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { UpdateProfileSchema } from "../types/types"
import type { AuthenticatedRequest } from "../types/http"

/** Updates the signed-in user's own name and email. Role is deliberately not editable here. */
export const updateProfileHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const parseResult = UpdateProfileSchema.safeParse(req.body)
  if (!parseResult.success) {
    return res.status(400).json({
      name: parseResult.error.name,
      message: parseResult.error.message,
      issues: parseResult.error.issues,
    })
  }

  const payload = parseResult.data
  const normalizedEmail = payload.email ? payload.email.toLowerCase() : undefined

  const updates: Record<string, string> = {}
  if (payload.firstName !== undefined) {
    updates.firstName = payload.firstName
  }
  if (payload.lastName !== undefined) {
    updates.lastName = payload.lastName
  }
  if (normalizedEmail !== undefined) {
    updates.email = normalizedEmail
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields to update" })
  }

  const userId = new ObjectId(req.user.id)

  try {
    if (normalizedEmail !== undefined) {
      const emailOwner = await appCtx.dbCtx.users.findOne({ email: normalizedEmail })
      if (emailOwner && !emailOwner._id.equals(userId)) {
        return res.status(409).json({ error: "A user with this email already exists" })
      }
    }

    const existingUser = await appCtx.dbCtx.users.findOne({ _id: userId })
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" })
    }

    const updatedUser = await appCtx.dbCtx.users.findOneAndUpdate(
      { _id: userId },
      { $set: updates },
      { returnDocument: "after", projection: { password: 0 } }
    )

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" })
    }

    await writeAuditLog(appCtx, {
      action: "user.profile.updated",
      entityType: "user",
      entityId: userId.toHexString(),
      details: {
        changedFields: Object.keys(updates),
        emailChanged: normalizedEmail !== undefined && normalizedEmail !== existingUser.email,
      },
      actor: req.user,
    })

    return res.status(200).json({
      _id: updatedUser._id.toHexString(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      disabled: updatedUser.disabled ?? false,
    })
  } catch (error) {
    console.error("Error updating own profile:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
