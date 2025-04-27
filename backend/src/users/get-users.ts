import { Response } from "express";
import { AppContext } from "../context/app-ctx";


export const getUsers = (appCtx: AppContext) => async (req: any, res: Response) => {
  if (req.user.role !== "admin") {
    console.log("Unauthorized: user is not admin")
    return res.status(401).json({ error: "Unauthorized: not admin" });
  }
  const user = await getUsersFromDB(appCtx);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json(user);
}


export const getUsersFromDB = async (appCtx: AppContext) => {
  const cursor = await appCtx.dbCtx.users.find({})
  const users = await cursor.toArray()
  if (!users) {
    return []
  }
  return users
}
