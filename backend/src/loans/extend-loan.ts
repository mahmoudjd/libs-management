import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isStaff } from "../lib/authorization"
import { parseObjectId } from "../lib/object-id"
import type { AuthenticatedRequest } from "../types/http"
import { isLoanOverdue, normalizeLoan } from "./loan-utils"

const MAX_EXTENSIONS = 2
const DEFAULT_EXTENSION_DAYS = 7
const MAX_EXTENSION_DAYS = 30

function parseExtensionDays(value: unknown) {
  if (value === undefined) {
    return DEFAULT_EXTENSION_DAYS
  }

  const parsed = Number.parseInt(String(value), 10)
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return null
  }

  if (parsed < 1 || parsed > MAX_EXTENSION_DAYS) {
    return null
  }

  return parsed
}

export const extendLoanHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
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

  const extensionDays = parseExtensionDays(req.body?.days)
  if (!extensionDays) {
    return res.status(400).json({
      error: `days must be between 1 and ${MAX_EXTENSION_DAYS}`,
    })
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
      return res.status(409).json({ error: "Returned loans cannot be extended" })
    }

    if (normalizedLoan.extensionCount >= MAX_EXTENSIONS) {
      return res.status(409).json({ error: "Loan reached extension limit" })
    }

    if (isLoanOverdue(normalizedLoan)) {
      return res.status(409).json({ error: "Overdue loans cannot be extended" })
    }

    const newReturnDate = new Date(
      normalizedLoan.returnDate.getTime() + extensionDays * 24 * 60 * 60 * 1000
    )

    const result = await appCtx.dbCtx.loans.updateOne(
      {
        _id: parsedLoanId,
        returnedAt: null,
        $or: [
          { extensionCount: { $lt: MAX_EXTENSIONS } },
          { extensionCount: { $exists: false } },
        ],
      },
      {
        $set: {
          returnDate: newReturnDate,
        },
        $inc: {
          extensionCount: 1,
        },
      }
    )

    if (result.matchedCount === 0) {
      return res.status(409).json({ error: "Loan extension failed" })
    }

    await writeAuditLog(appCtx, {
      action: "loan.extended",
      entityType: "loan",
      entityId: parsedLoanId.toHexString(),
      details: {
        previousReturnDate: normalizedLoan.returnDate,
        newReturnDate,
        extensionDays,
        previousExtensionCount: normalizedLoan.extensionCount,
        nextExtensionCount: normalizedLoan.extensionCount + 1,
      },
      actor: req.user,
    })

    return res.status(200).json({
      message: "Loan extended successfully",
      returnDate: newReturnDate,
      extensionCount: normalizedLoan.extensionCount + 1,
      maxExtensions: MAX_EXTENSIONS,
    })
  } catch (error) {
    console.error("Error extending loan:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
