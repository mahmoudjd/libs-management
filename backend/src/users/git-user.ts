import { Response } from "express";
import { AppContext } from "../context/app-ctx";
import { ObjectId } from "mongodb";


export const getUser = (appCtx: AppContext) => async (req: any, res: Response) => {
  const userId = req.params.userId;
  const user = await getUserById(appCtx, userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.json(user);
}


const getUserById = async (appCtx: AppContext, userId: string) => {
  const user = await appCtx.dbCtx.users.findOne({ _id: new ObjectId(userId) })
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
