import { Response } from "express"
import type { ObjectId } from "mongodb"

import { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isStaff } from "../lib/authorization"
import { parseObjectId } from "../lib/object-id"
import type { AuthenticatedRequest } from "../types/http"
import { fulfillNextReservationIfPossible } from "../reservations/reservation-service"
import { normalizeLoan } from "./loan-utils"

export const deleteLoandHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { loanId } = req.params

  if (!isStaff(req.user)) {
    return res.status(403).json({ error: "Only staff can delete loans" })
  }

  if (!loanId) {
    return res.status(400).json({ error: "Missing loan ID" })
  }

  const parsedLoanId = parseObjectId(loanId)
  if (!parsedLoanId) {
    return res.status(400).json({ error: "Invalid loan ID" })
  }

  try {
    const deletedLoan = await deleteLoan(appCtx, parsedLoanId)
    if (!deletedLoan) {
      return res.status(404).json({ error: "Loan not found" })
    }

    await writeAuditLog(appCtx, {
      action: "loan.deleted",
      entityType: "loan",
      entityId: parsedLoanId.toHexString(),
      details: {
        bookId: deletedLoan.bookId.toHexString(),
        userId: deletedLoan.userId.toHexString(),
      },
      actor: req.user,
    })

    return res.status(200).json({ message: "Loan deleted successfully" })
  } catch (error) {
    console.error("Error deleting loan:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

const deleteLoan = async (appCtx: AppContext, loanId: ObjectId) => {
  const existingLoan = await appCtx.dbCtx.loans.findOne({ _id: loanId })
  if (!existingLoan) {
    return null
  }

  const normalizedLoan = normalizeLoan(existingLoan)

  const deleteResult = await appCtx.dbCtx.loans.deleteOne({ _id: loanId })
  if (deleteResult.deletedCount === 0) {
    return null
  }

  if (!normalizedLoan.returnedAt) {
    await appCtx.dbCtx.books.updateOne(
      { _id: normalizedLoan.bookId },
      {
        $inc: { availableCopies: 1 },
        $set: { updatedAt: new Date() },
      }
    )

    await fulfillNextReservationIfPossible(appCtx, normalizedLoan.bookId)
  }

  return normalizedLoan
}
