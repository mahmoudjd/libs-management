import { Response } from "express"
import type { ObjectId } from "mongodb"

import { AppContext } from "../context/app-ctx"
import { parseObjectId } from "../lib/object-id"
import type { AuthenticatedRequest } from "../types/http"

export const deleteLoandHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { loanId } = req.params

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" })
  }

  if (!loanId) {
    return res.status(400).json({ error: "Missing loan ID" })
  }

  const parsedLoanId = parseObjectId(loanId)
  if (!parsedLoanId) {
    return res.status(400).json({ error: "Invalid loan ID" })
  }

  try {
    const deleted = await deleteLoan(appCtx, parsedLoanId)
    if (!deleted) {
      return res.status(404).json({ error: "Loan not found" })
    }

    return res.status(200).json({ message: "Loan deleted successfully" })
  } catch (error) {
    console.error("Error deleting loan:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

const deleteLoan = async (appCtx: AppContext, loanId: ObjectId) => {
  const existingLoan = await appCtx.dbCtx.loans.findOne({ _id: loanId })
  if (!existingLoan) {
    return false
  }

  const deleteResult = await appCtx.dbCtx.loans.deleteOne({ _id: loanId })
  if (deleteResult.deletedCount === 0) {
    return false
  }

  await appCtx.dbCtx.books.updateOne({ _id: existingLoan.bookId }, { $set: { available: true } })
  return true
}
