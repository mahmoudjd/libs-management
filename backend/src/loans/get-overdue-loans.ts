import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { isStaff } from "../lib/authorization"
import type { AuthenticatedRequest } from "../types/http"
import { toBookResponse } from "../books/book-stock"
import { toLoanResponse } from "./loan-utils"

export const getOverdueLoansHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!isStaff(req.user)) {
    return res.status(403).json({ error: "Only staff can view overdue loans" })
  }

  const now = new Date()

  try {
    const [loans, users, books] = await Promise.all([
      appCtx.dbCtx.loans.find({ returnedAt: null, returnDate: { $lt: now } }).sort({ returnDate: 1 }).toArray(),
      appCtx.dbCtx.users.find({}, { projection: { firstName: 1, lastName: 1, email: 1, role: 1 } }).toArray(),
      appCtx.dbCtx.books.find({}).toArray(),
    ])

    const usersById = new Map(users.map((user) => [user._id.toHexString(), user]))
    const booksById = new Map(books.map((book) => [book._id.toHexString(), book]))

    const response = loans.map((loan) => {
      const user = usersById.get(loan.userId.toHexString())
      const book = booksById.get(loan.bookId.toHexString())

      return {
        ...toLoanResponse(loan, now),
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

    return res.status(200).json(response)
  } catch (error) {
    console.error("Error getting overdue loans:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
