import { Response } from "express"

import type { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isStaff } from "../lib/authorization"
import { parseObjectId } from "../lib/object-id"
import { BookSchema } from "../types/types"
import type { AuthenticatedRequest } from "../types/http"
import { normalizeBookStock, toBookResponse } from "./book-stock"

/**
  * Update book handler
  * @param appCtx
  */
export const updateBookHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { bookId } = req.params
  if (!isStaff(req.user)) {
    return res.status(403).json({ error: "Only staff can update books" })
  }

  const parsedBookId = parseObjectId(bookId)
  if (!parsedBookId) {
    return res.status(400).json({ error: "Invalid book ID" })
  }

  try {
    const parseResult = BookSchema.safeParse(req.body)
    if (!parseResult.success) {
      console.debug(
        `Invalid request body for method ${req.method} ${req.originalUrl} with error ${parseResult.error.toString()}`
      )
      return res.status(400).json(parseResult.error)
    }

    const existingBook = await appCtx.dbCtx.books.findOne({ _id: parsedBookId })
    if (!existingBook) {
      return res.status(404).json({ error: "Book not found" })
    }

    const payload = parseResult.data
    const existingStock = normalizeBookStock(existingBook)

    const nextTotalCopies = payload.totalCopies ?? existingStock.totalCopies
    let nextAvailableCopies = existingStock.availableCopies

    if (payload.availableCopies !== undefined) {
      nextAvailableCopies = payload.availableCopies
    } else if (payload.available !== undefined) {
      nextAvailableCopies = payload.available ? nextTotalCopies : 0
    } else if (payload.totalCopies !== undefined) {
      const delta = payload.totalCopies - existingStock.totalCopies
      nextAvailableCopies = existingStock.availableCopies + delta
    }

    nextAvailableCopies = Math.max(0, Math.min(nextTotalCopies, nextAvailableCopies))

    const activeLoanCount = await appCtx.dbCtx.loans.countDocuments({
      bookId: parsedBookId,
      returnedAt: null,
    })

    if (nextTotalCopies < activeLoanCount) {
      return res.status(400).json({
        error: "totalCopies is lower than current active loans",
      })
    }

    const maxAvailableCopies = nextTotalCopies - activeLoanCount
    if (nextAvailableCopies > maxAvailableCopies) {
      return res.status(400).json({
        error: "availableCopies exceeds available stock after active loans",
      })
    }

    const now = new Date()
    const updatedBook = await appCtx.dbCtx.books.findOneAndUpdate(
      { _id: parsedBookId },
      {
        $set: {
          title: payload.title,
          author: payload.author,
          genre: payload.genre,
          totalCopies: nextTotalCopies,
          availableCopies: nextAvailableCopies,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    )

    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" })
    }

    await writeAuditLog(appCtx, {
      action: "book.updated",
      entityType: "book",
      entityId: parsedBookId.toHexString(),
      details: {
        before: {
          title: existingBook.title,
          author: existingBook.author,
          genre: existingBook.genre,
          totalCopies: existingStock.totalCopies,
          availableCopies: existingStock.availableCopies,
        },
        after: {
          title: updatedBook.title,
          author: updatedBook.author,
          genre: updatedBook.genre,
          totalCopies: updatedBook.totalCopies,
          availableCopies: updatedBook.availableCopies,
        },
      },
      actor: req.user,
    })

    return res.status(200).json({
      message: "Book updated successfully",
      book: toBookResponse(updatedBook),
    })
  } catch (error) {
    console.error(`⚠ Books: ${error}`)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
