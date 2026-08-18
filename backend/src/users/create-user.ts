import { Response } from "express"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"

import type { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isAdmin } from "../lib/authorization"
import { CreateUserSchema } from "../types/types"
import type { AuthenticatedRequest } from "../types/http"

/** Admin-created account. Unlike signup this may set any role straight away. */
export const createUserHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: "Only admins can create users" })
  }

  const parseResult = CreateUserSchema.safeParse(req.body)
  if (!parseResult.success) {
    return res.status(400).json({
      name: parseResult.error.name,
      message: parseResult.error.message,
      issues: parseResult.error.issues,
    })
  }

  const payload = parseResult.data
  const normalizedEmail = payload.email.toLowerCase()

  try {
    const existingUser = await appCtx.dbCtx.users.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(409).json({ error: "A user with this email already exists" })
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10)
    const userId = new ObjectId()

    await appCtx.dbCtx.users.insertOne({
      _id: userId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: normalizedEmail,
      password: hashedPassword,
      role: payload.role,
      disabled: false,
    })

    await writeAuditLog(appCtx, {
      action: "user.created",
      entityType: "user",
      entityId: userId.toHexString(),
      details: { email: normalizedEmail, role: payload.role, createdBy: "admin" },
      actor: req.user,
    })

    return res.status(201).json({
      _id: userId.toHexString(),
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: normalizedEmail,
      role: payload.role,
      disabled: false,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
