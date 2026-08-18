import { Response } from "express"

import { ObjectId } from "mongodb"

import type { AppContext } from "../context/app-ctx"
import type { AuthenticatedRequest } from "../types/http"

/** The signed-in user's own profile — no id in the path, so no ownership check. */
export const getMeHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    const user = await appCtx.dbCtx.users.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    )

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.status(200).json({
      _id: user._id.toHexString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      disabled: user.disabled ?? false,
    })
  } catch (error) {
    console.error("Error loading own profile:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
