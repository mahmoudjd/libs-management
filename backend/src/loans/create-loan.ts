import { Response } from "express"
import { ObjectId } from "mongodb"

import type { AppContext } from "../context/app-ctx"
import { LoanSchema } from "../types/types"
import { parseObjectId } from "../lib/object-id"
import { canAccessUserResource, type AuthenticatedRequest } from "../types/http"

interface CreateLoanInput {
  bookId: ObjectId
  userId: ObjectId
  returnDate: Date
  method: string
  url: string
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

  if (!canAccessUserResource(req, requestedUserId)) {
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
    const loan = await createLoan(appCtx, {
      bookId: parsedBookId,
      userId: parsedUserId,
      returnDate: parsedReturnDate,
      method: req.method,
      url: req.originalUrl,
    })

    if (!loan) {
      return res.status(409).json({ error: "Book is not available" })
    }

    return res.status(201).json(loan)
  } catch (error) {
    console.error("Error creating loan:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

async function createLoan(appCtx: AppContext, input: CreateLoanInput) {
  const reservedBook = await appCtx.dbCtx.books.findOneAndUpdate(
    { _id: input.bookId, available: true },
    { $set: { available: false } },
    { returnDocument: "before" }
  )

  if (!reservedBook) {
    return null
  }

  const parseResult = LoanSchema.safeParse({
    bookId: input.bookId,
    userId: input.userId,
    returnDate: input.returnDate,
    loanDate: new Date(),
  })

  if (!parseResult.success) {
    console.debug(
      `Invalid request body for method ${input.method} ${input.url}: ${parseResult.error.toString()}`
    )
    await appCtx.dbCtx.books.updateOne({ _id: input.bookId }, { $set: { available: true } })
    return null
  }

  const loan = parseResult.data

  try {
    const result = await appCtx.dbCtx.loans.insertOne({
      ...loan,
      _id: new ObjectId(),
    })

    if (!result.acknowledged) {
      throw new Error("Failed to insert loan into the database")
    }

    return {
      _id: result.insertedId,
      ...loan,
    }
  } catch (error) {
    await appCtx.dbCtx.books.updateOne({ _id: input.bookId }, { $set: { available: true } })
    throw error
  }
}
