import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { parseObjectId } from "../lib/object-id"
import { isStaff } from "../lib/authorization"
import type { AuthenticatedRequest } from "../types/http"
import { normalizeBookStock } from "../books/book-stock"
import { createPendingReservation, hasPendingReservationForUser } from "./reservation-service"
import { toReservationResponse } from "./reservation-response"

export const createReservationHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const requestedBookId = req.body?.bookId
  if (!requestedBookId) {
    return res.status(400).json({ error: "bookId is required" })
  }

  const targetUserIdRaw = isStaff(req.user) && req.body?.userId
    ? String(req.body.userId)
    : req.user.id

  const parsedBookId = parseObjectId(String(requestedBookId))
  const parsedUserId = parseObjectId(targetUserIdRaw)

  if (!parsedBookId || !parsedUserId) {
    return res.status(400).json({ error: "Invalid bookId or userId" })
  }

  if (!isStaff(req.user) && parsedUserId.toHexString() !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" })
  }

  try {
    const [book, user] = await Promise.all([
      appCtx.dbCtx.books.findOne({ _id: parsedBookId }),
      appCtx.dbCtx.users.findOne({ _id: parsedUserId }),
    ])

    if (!book) {
      return res.status(404).json({ error: "Book not found" })
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const stock = normalizeBookStock(book)
    if (stock.availableCopies > 0) {
      return res.status(409).json({
        error: "Book has available copies. Borrow instead of reserving.",
      })
    }

    const hasPendingReservation = await hasPendingReservationForUser(appCtx, parsedBookId, parsedUserId)
    if (hasPendingReservation) {
      return res.status(409).json({ error: "Pending reservation already exists" })
    }

    const reservation = await createPendingReservation(appCtx, {
      bookId: parsedBookId,
      userId: parsedUserId,
    }, req.user)

    if (!reservation) {
      return res.status(500).json({ error: "Could not create reservation" })
    }

    return res.status(201).json(toReservationResponse(reservation))
  } catch (error) {
    console.error("Error creating reservation:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
