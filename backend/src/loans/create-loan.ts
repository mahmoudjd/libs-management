import { Response } from "express"
import { ObjectId } from "mongodb"

import type { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isStaff } from "../lib/authorization"
import { LoanSchema } from "../types/types"
import { parseObjectId } from "../lib/object-id"
import { canAccessUserResource, type AuthenticatedRequest } from "../types/http"
import {
  fulfillPendingReservationForUser,
  hasPendingReservationForOtherUser,
} from "../reservations/reservation-service"
import { toLoanResponse } from "./loan-utils"

interface CreateLoanInput {
  bookId: ObjectId
  userId: ObjectId
  returnDate: Date
}

export const createLoanHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { bookId, userId, returnDate } = req.body

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (!bookId || !userId || !returnDate) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  const requestedBookId = String(bookId)
  const requestedUserId = String(userId)

  if (!isStaff(req.user) && !canAccessUserResource(req, requestedUserId)) {
    return res.status(403).json({ error: "Forbidden" })
  }

  const parsedBookId = parseObjectId(requestedBookId)
  const parsedUserId = parseObjectId(requestedUserId)
  if (!parsedBookId || !parsedUserId) {
    return res.status(400).json({ error: "Invalid bookId or userId" })
  }

  const parsedReturnDate = new Date(returnDate)
  if (Number.isNaN(parsedReturnDate.getTime())) {
    return res.status(400).json({ error: "Invalid returnDate" })
  }

  try {
    const user = await appCtx.dbCtx.users.findOne({ _id: parsedUserId })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const loan = await createLoan(appCtx, {
      bookId: parsedBookId,
      userId: parsedUserId,
      returnDate: parsedReturnDate,
    }, req.user)

    if (loan === "reserved") {
      return res.status(409).json({ error: "Book is reserved for another user" })
    }

    if (!loan) {
      return res.status(409).json({ error: "Book is not available" })
    }

    return res.status(201).json(toLoanResponse(loan))
  } catch (error) {
    console.error("Error creating loan:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function createLoan(appCtx: AppContext, input: CreateLoanInput, actor: AuthenticatedRequest["user"]) {
  const existingBook = await appCtx.dbCtx.books.findOne({ _id: input.bookId })
  if (!existingBook) {
    return null
  }

  const reservedForAnotherUser = await hasPendingReservationForOtherUser(
    appCtx,
    input.bookId,
    input.userId
  )
  if (reservedForAnotherUser) {
    return "reserved" as const
  }

  const now = new Date()
  const reservedBook = await appCtx.dbCtx.books.findOneAndUpdate(
    {
      _id: input.bookId,
      availableCopies: { $gt: 0 },
    },
    {
      $inc: { availableCopies: -1 },
      $set: { updatedAt: now },
    },
    { returnDocument: "before" }
  )

  if (!reservedBook) {
    return null
  }

  const parseResult = LoanSchema.safeParse({
    bookId: input.bookId,
    userId: input.userId,
    returnDate: input.returnDate,
    loanDate: now,
    returnedAt: null,
    extensionCount: 0,
    source: "direct",
  })

  if (!parseResult.success) {
    await appCtx.dbCtx.books.updateOne({ _id: input.bookId }, { $inc: { availableCopies: 1 } })
    return null
  }

  const loan = parseResult.data
  const insertedLoanId = new ObjectId()

  try {
    await appCtx.dbCtx.loans.insertOne({
      ...loan,
      _id: insertedLoanId,
    })

    await fulfillPendingReservationForUser(appCtx, input.bookId, input.userId, actor)

    await writeAuditLog(appCtx, {
      action: "loan.created",
      entityType: "loan",
      entityId: insertedLoanId.toHexString(),
      details: {
        bookId: input.bookId.toHexString(),
        userId: input.userId.toHexString(),
        source: "direct",
      },
      actor,
    })

    return {
      _id: insertedLoanId,
      ...loan,
    }
  } catch (error) {
    await appCtx.dbCtx.books.updateOne({ _id: input.bookId }, { $inc: { availableCopies: 1 } })
    throw error
  }
}
