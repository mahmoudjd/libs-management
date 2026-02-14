import {Response} from "express";
import {AppContext} from "../context/app-ctx";
import type {AuthenticatedRequest} from "../types/http";


export const getUsers = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== "admin") {
    console.log("Unauthorized: user is not admin")
    return res.status(403).json({ error: "Unauthorized: not admin" });
  }
  const users = await getUsersFromDB(appCtx);
  return res.json(users);
}


export const getUsersFromDB = async (appCtx: AppContext) => {
  const cursor = appCtx.dbCtx.users.find({}, { projection: { password: 0 } })
    return await cursor.toArray()
}
