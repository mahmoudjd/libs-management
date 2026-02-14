import { Response } from "express";
import { AppContext } from "../context/app-ctx";
import type { ObjectId } from "mongodb";
import { parseObjectId } from "../lib/object-id";
import { canAccessUserResource, type AuthenticatedRequest } from "../types/http";


export const getUser = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.userId;
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!canAccessUserResource(req, userId)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const parsedUserId = parseObjectId(userId)
  if (!parsedUserId) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const user = await getUserById(appCtx, parsedUserId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json(user);
}


const getUserById = async (appCtx: AppContext, userId: ObjectId) => {
  const user = await appCtx.dbCtx.users.findOne(
    { _id: userId },
    { projection: { firstName: 1, lastName: 1, email: 1, role: 1 } }
  )
  if (!user) {
    return null
  }

  return {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role
  }
}
