import { ObjectId } from "mongodb"
import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { isStaff } from "../lib/authorization"
import type { AuthenticatedRequest } from "../types/http"
import { toBookResponse } from "../books/book-stock"
import type { ReservationDb } from "../types/types"
import { toReservationResponse } from "./reservation-response"

function getStatusFilter(status: unknown) {
  if (status === "pending" || status === "fulfilled" || status === "cancelled") {
    return status
  }
  return undefined
}

function toEnrichedReservationResponse(
  reservations: ReservationDb[],
  books: Array<{ _id: ReservationDb["bookId"]; title: string; author: string; genre: string; totalCopies?: number; availableCopies?: number; available?: boolean; createdAt?: Date; updatedAt?: Date }>,
  users: Array<{ _id: ReservationDb["userId"]; firstName: string; lastName: string; email: string; role: string }>
) {
  const booksById = new Map(books.map((book) => [book._id.toHexString(), book]))
  const usersById = new Map(users.map((user) => [user._id.toHexString(), user]))

  return reservations.map((reservation) => {
    const book = booksById.get(reservation.bookId.toHexString())
    const user = usersById.get(reservation.userId.toHexString())

    return {
      ...toReservationResponse(reservation),
      book: book ? toBookResponse(book) : null,
      user: user
        ? {
          id: user._id.toHexString(),
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        }
        : null,
    }
  })
}

export const getMyReservationsHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const status = getStatusFilter(req.query.status)

  try {
    const [rows, books, users] = await Promise.all([
      appCtx.dbCtx.reservations.find({
        userId: new ObjectId(req.user.id),
        ...(status ? { status } : {}),
      }).sort({ createdAt: -1 }).toArray(),
      appCtx.dbCtx.books.find({}).toArray(),
      appCtx.dbCtx.users.find({}, { projection: { firstName: 1, lastName: 1, email: 1, role: 1 } }).toArray(),
    ])

    return res.status(200).json(toEnrichedReservationResponse(rows, books, users))
  } catch (error) {
    console.error("Error getting my reservations:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const getReservationsHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!isStaff(req.user)) {
    return res.status(403).json({ error: "Only staff can list reservations" })
  }

  const status = getStatusFilter(req.query.status)

  try {
    const [rows, books, users] = await Promise.all([
      appCtx.dbCtx.reservations.find(status ? { status } : {}).sort({ createdAt: -1 }).toArray(),
      appCtx.dbCtx.books.find({}).toArray(),
      appCtx.dbCtx.users.find({}, { projection: { firstName: 1, lastName: 1, email: 1, role: 1 } }).toArray(),
    ])

    return res.status(200).json(toEnrichedReservationResponse(rows, books, users))
  } catch (error) {
    console.error("Error getting reservations:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
