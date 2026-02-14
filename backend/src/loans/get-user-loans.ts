import { Response } from "express"
import type { Filter } from "mongodb"

import { AppContext } from "../context/app-ctx"
import { parseObjectId } from "../lib/object-id"
import { isStaff } from "../lib/authorization"
import { canAccessUserResource, type AuthenticatedRequest } from "../types/http"
import type { LoanDb } from "../types/types"
import { hasPaginationQuery, parsePagination } from "../lib/pagination"
import { toBookResponse } from "../books/book-stock"
import { toLoanResponse } from "./loan-utils"

function getUserLoanFilter(userId: LoanDb["userId"], status: unknown): Filter<LoanDb> {
  const now = new Date()
  const filter: Filter<LoanDb> = { userId }

  if (status === "active") {
    filter.returnedAt = null
    filter.returnDate = { $gte: now }
  } else if (status === "overdue") {
    filter.returnedAt = null
    filter.returnDate = { $lt: now }
  } else if (status === "returned") {
    filter.returnedAt = { $ne: null }
  }

  return filter
}

export const getLoansByUserIdHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (!canAccessUserResource(req, userId) && !isStaff(req.user)) {
    return res.status(403).json({ message: "Forbidden" })
  }

  const parsedUserId = parseObjectId(userId)
  if (!parsedUserId) {
    return res.status(400).json({ message: "Invalid user ID" })
  }

  try {
    const filter = getUserLoanFilter(parsedUserId, req.query.status)

    if (hasPaginationQuery(req.query as Record<string, unknown>)) {
      const { page, pageSize, skip } = parsePagination(req.query as Record<string, unknown>, {
        defaultPage: 1,
        defaultPageSize: 20,
        maxPageSize: 100,
      })

      const [loans, books, total] = await Promise.all([
        appCtx.dbCtx.loans.find(filter).sort({ loanDate: -1 }).skip(skip).limit(pageSize).toArray(),
        appCtx.dbCtx.books.find({}).toArray(),
        appCtx.dbCtx.loans.countDocuments(filter),
      ])

      return res.status(200).json({
        items: enrichUserLoans(loans, books),
        total,
        page,
        pageSize,
      })
    }

    const [loans, books] = await Promise.all([
      appCtx.dbCtx.loans.find(filter).sort({ loanDate: -1 }).toArray(),
      appCtx.dbCtx.books.find({}).toArray(),
    ])

    return res.status(200).json(enrichUserLoans(loans, books))
  } catch {
    return res.status(500).json({ message: "Internal server error" })
  }
}

function enrichUserLoans(
  loans: LoanDb[],
  books: Array<{ _id: LoanDb["bookId"]; title: string; author: string; genre: string; totalCopies?: number; availableCopies?: number; available?: boolean; createdAt?: Date; updatedAt?: Date }>
) {
  const booksById = new Map(books.map((book) => [book._id.toHexString(), book]))

  return loans.map((loan) => {
    const book = booksById.get(loan.bookId.toHexString())
    return {
      ...toLoanResponse(loan),
      book: book ? toBookResponse(book) : null,
    }
  })
}
