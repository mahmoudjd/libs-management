import { Response } from "express";
import { AppContext } from "../context/app-ctx";
import { LoanDb } from "../types/types";

export const getLoansHandler = (appCtx: AppContext) => async (req: any, res: Response) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not admin" })
    }

    const loans = await getLoans(appCtx)
    return res.status(200).json(loans)
  } catch (error) {
    console.error(`⚠ Loans: ${error}`)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

const getLoans = async (appCtx: AppContext): Promise<LoanDb[]> => {
  const cursor = appCtx.dbCtx.loans.find({})
  const loans = await cursor.toArray()
  return loans
}
