import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isStaff } from "../lib/authorization"
import { parseObjectId } from "../lib/object-id"
import type { AuthenticatedRequest } from "../types/http"
import { fulfillNextReservationIfPossible } from "../reservations/reservation-service"
import { normalizeLoan } from "./loan-utils"

export const updateLoanHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { loanId } = req.params

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

  try {
    const existingLoan = await appCtx.dbCtx.loans.findOne({ _id: parsedLoanId })
    if (!existingLoan) {
      return res.status(404).json({ error: "Loan not found" })
    }

    const normalizedLoan = normalizeLoan(existingLoan)

    if (!isStaff(req.user) && req.user.id !== normalizedLoan.userId.toHexString()) {
      return res.status(403).json({ error: "Forbidden" })
    }

    if (normalizedLoan.returnedAt) {
      return res.status(409).json({ error: "Loan already returned" })
    }

    const returnedAt = new Date()
    const success = await appCtx.dbCtx.loans.updateOne(
      { _id: parsedLoanId, returnedAt: null },
      {
        $set: {
          returnedAt,
        },
      }
    )

    if (success.matchedCount === 0) {
      return res.status(404).json({ error: "Loan update failed" })
    }

    await appCtx.dbCtx.books.updateOne(
      { _id: normalizedLoan.bookId },
      {
        $inc: { availableCopies: 1 },
        $set: { updatedAt: returnedAt },
      }
    )

    const reservationFulfillment = await fulfillNextReservationIfPossible(
      appCtx,
      normalizedLoan.bookId,
      req.user
    )

    await writeAuditLog(appCtx, {
      action: "loan.returned",
      entityType: "loan",
      entityId: parsedLoanId.toHexString(),
      details: {
        bookId: normalizedLoan.bookId.toHexString(),
        userId: normalizedLoan.userId.toHexString(),
        returnedAt,
        autoReservationFulfilled: Boolean(reservationFulfillment),
      },
      actor: req.user,
    })

    return res.status(200).json({
      message: "Loan returned successfully",
      autoReservationFulfilled: Boolean(reservationFulfillment),
    })
  } catch (error) {
    console.error("Error updating loan:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
