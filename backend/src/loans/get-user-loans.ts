import { Response } from "express";
import { AppContext } from "../context/app-ctx";
import { ObjectId } from "mongodb";


export const getLoansByUserIdHandler = (appCtx: AppContext) => async (req: any, res: Response) => {
  const { userId } = req.params
  try {
    const userLoans = await getuserLoans(appCtx, userId)

    if (!userLoans) {
      return res.status(404).json({ message: "Not found loans" })
    }
    return res.status(200).json(userLoans)

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" })
  }
}

const getuserLoans = async (appCtx: AppContext, userId: string) => {
  const cursor = appCtx.dbCtx.loans.find({ userId: new ObjectId(userId) })
  const loans = await cursor.toArray()
  return loans
}
