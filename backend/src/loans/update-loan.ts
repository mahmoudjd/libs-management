import { Response } from "express"
import type { ObjectId } from "mongodb"

import { AppContext } from "../context/app-ctx"
import { parseObjectId } from "../lib/object-id"
import type { AuthenticatedRequest } from "../types/http"

export const updateLoanHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { loanId } = req.params
  const { returnDate } = req.body

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (!loanId) {
    return res.status(400).json({ error: "Missing loan ID" })
  }

  const parsedLoanId = parseObjectId(loanId)
  if (!parsedLoanId) {
    return res.status(400).json({ error: "Invalid loan ID" })
  }

  const parsedReturnDate = new Date(returnDate)
  if (Number.isNaN(parsedReturnDate.getTime())) {
    return res.status(400).json({ error: "Invalid returnDate" })
  }

  try {
    const existingLoan = await appCtx.dbCtx.loans.findOne({ _id: parsedLoanId })
    if (!existingLoan) {
      return res.status(404).json({ error: "Loan not found" })
    }

    if (req.user.role !== "admin" && req.user.id !== existingLoan.userId.toHexString()) {
      return res.status(403).json({ error: "Forbidden" })
    }

    const success = await updateLoan(appCtx, parsedLoanId, parsedReturnDate)
    if (!success) {
      return res.status(404).json({ error: "Loan update failed" })
    }

    if (parsedReturnDate.getTime() <= Date.now()) {
      await appCtx.dbCtx.books.updateOne(
        { _id: existingLoan.bookId },
        { $set: { available: true } }
      )
    }

    return res.status(200).json({ message: "Loan updated successfully" })
  } catch (error) {
    console.error("Error updating loan:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

const updateLoan = async (appCtx: AppContext, loanId: ObjectId, returnDate: Date) => {
  const result = await appCtx.dbCtx.loans.updateOne(
    { _id: loanId },
    {
      $set: {
        returnDate,
      },
    }
  )

  return result.matchedCount > 0
}
