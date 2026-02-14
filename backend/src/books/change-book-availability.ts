import type { ObjectId } from "mongodb"
import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isStaff } from "../lib/authorization"
import type { AuthenticatedRequest } from "../types/http"
import { parseObjectId } from "../lib/object-id"
import { normalizeBookStock } from "./book-stock"
import { fulfillNextReservationIfPossible } from "../reservations/reservation-service"

export const changeBookAvailability = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { bookId } = req.params

  if (!isStaff(req.user)) {
    return res.status(403).json({ error: "Only staff can change book availability" })
  }

  const parsedBookId = parseObjectId(bookId)
  if (!parsedBookId) {
    return res.status(400).json({ error: "Invalid book ID" })
  }

  const requestedAvailable = req.body?.available
  const requestedAvailableCopies = req.body?.availableCopies

  if (requestedAvailable !== undefined && typeof requestedAvailable !== "boolean") {
    return res.status(400).json({ error: "available must be a boolean" })
  }

  if (requestedAvailableCopies !== undefined) {
    const parsedValue = Number.parseInt(String(requestedAvailableCopies), 10)
    if (!Number.isFinite(parsedValue) || Number.isNaN(parsedValue) || parsedValue < 0) {
      return res.status(400).json({ error: "availableCopies must be a positive integer or 0" })
    }
  }

  try {
    const existingBook = await appCtx.dbCtx.books.findOne({ _id: parsedBookId })
    if (!existingBook) {
      return res.status(404).json({ error: "Book not found" })
    }

    const stock = normalizeBookStock(existingBook)
    const activeLoanCount = await appCtx.dbCtx.loans.countDocuments({
      bookId: parsedBookId,
      returnedAt: null,
    })

    const maxAvailableCopies = stock.totalCopies - activeLoanCount
    if (maxAvailableCopies < 0) {
      return res.status(409).json({ error: "Book stock is inconsistent with active loans" })
    }

    let nextAvailableCopies = stock.availableCopies

    if (requestedAvailableCopies !== undefined) {
      nextAvailableCopies = Number.parseInt(String(requestedAvailableCopies), 10)
    } else if (requestedAvailable !== undefined) {
      nextAvailableCopies = requestedAvailable ? maxAvailableCopies : 0
    } else {
      nextAvailableCopies = maxAvailableCopies
    }

    if (nextAvailableCopies > maxAvailableCopies) {
      return res.status(400).json({
        error: "availableCopies exceeds available stock after active loans",
      })
    }

    const updatedBook = await updateBookAvailabilityInDB(appCtx, parsedBookId, nextAvailableCopies)
    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" })
    }

    let fulfilledReservations = 0
    if (nextAvailableCopies > stock.availableCopies) {
      while (true) {
        const fulfilled = await fulfillNextReservationIfPossible(appCtx, parsedBookId, req.user)
        if (!fulfilled) {
          break
        }
        fulfilledReservations += 1
      }
    }

    await writeAuditLog(appCtx, {
      action: "book.availability.changed",
      entityType: "book",
      entityId: parsedBookId.toHexString(),
      details: {
        previousAvailableCopies: stock.availableCopies,
        nextAvailableCopies,
        fulfilledReservations,
      },
      actor: req.user,
    })

    return res.status(200).json({
      message: "Book availability updated successfully",
      fulfilledReservations,
    })
  } catch (error) {
    console.error(`⚠ Books: ${error}`)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}

async function updateBookAvailabilityInDB(appCtx: AppContext, bookId: ObjectId, availableCopies: number) {
  const now = new Date()
  return appCtx.dbCtx.books.findOneAndUpdate(
    { _id: bookId },
    {
      $set: {
        availableCopies,
        updatedAt: now,
      },
    },
    {
      returnDocument: "after",
    }
  )
}
