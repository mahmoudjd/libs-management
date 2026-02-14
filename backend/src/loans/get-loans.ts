import { Response } from "express"
import type { Filter, Sort } from "mongodb"

import { AppContext } from "../context/app-ctx"
import { isStaff } from "../lib/authorization"
import { hasPaginationQuery, parsePagination } from "../lib/pagination"
import { parseObjectId } from "../lib/object-id"
import type { AuthenticatedRequest } from "../types/http"
import type { LoanDb } from "../types/types"
import { toBookResponse } from "../books/book-stock"
import { toLoanResponse } from "./loan-utils"

function parseBoolean(value: unknown) {
  if (typeof value !== "string") {
    return false
  }
  return value === "true" || value === "1"
}

function getLoanSort(query: AuthenticatedRequest["query"]): Sort {
  const sortByRaw = typeof query.sortBy === "string" ? query.sortBy : "loanDate"
  const orderRaw = typeof query.order === "string" ? query.order : "desc"

  const allowedSortFields: Record<string, string> = {
    loanDate: "loanDate",
    returnDate: "returnDate",
    returnedAt: "returnedAt",
    extensionCount: "extensionCount",
  }

  const sortField = allowedSortFields[sortByRaw] ?? "loanDate"
  const direction = orderRaw === "asc" ? 1 : -1
  return { [sortField]: direction }
}

function getLoanFilter(req: AuthenticatedRequest): Filter<LoanDb> {
  const { query } = req
  const now = new Date()
  const filter: Filter<LoanDb> = {}

  const status = typeof query.status === "string" ? query.status : undefined
  if (status === "active") {
    filter.returnedAt = null
    filter.returnDate = { $gte: now }
  } else if (status === "overdue") {
    filter.returnedAt = null
    filter.returnDate = { $lt: now }
  } else if (status === "returned") {
    filter.returnedAt = { $ne: null }
  }

  if (parseBoolean(query.overdue)) {
    filter.returnedAt = null
    filter.returnDate = { $lt: now }
  }

  const userIdParam = typeof query.userId === "string" ? query.userId : undefined
  if (userIdParam) {
    const parsedUserId = parseObjectId(userIdParam)
    if (parsedUserId) {
      filter.userId = parsedUserId
    }
  }

  return filter
}

export const getLoansHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ message: "Only staff can list all loans" })
    }

    const filter = getLoanFilter(req)
    const sort = getLoanSort(req.query)

    if (hasPaginationQuery(req.query as Record<string, unknown>)) {
      const { page, pageSize, skip } = parsePagination(req.query as Record<string, unknown>, {
        defaultPage: 1,
        defaultPageSize: 20,
        maxPageSize: 100,
      })

      const [loans, users, books, total] = await Promise.all([
        appCtx.dbCtx.loans.find(filter).sort(sort).skip(skip).limit(pageSize).toArray(),
        appCtx.dbCtx.users.find({}, { projection: { firstName: 1, lastName: 1, email: 1, role: 1 } }).toArray(),
        appCtx.dbCtx.books.find({}).toArray(),
        appCtx.dbCtx.loans.countDocuments(filter),
      ])

      const items = toEnrichedLoanResponse(loans, users, books)
      return res.status(200).json({ items, total, page, pageSize })
    }

    const [loans, users, books] = await Promise.all([
      appCtx.dbCtx.loans.find(filter).sort(sort).toArray(),
      appCtx.dbCtx.users.find({}, { projection: { firstName: 1, lastName: 1, email: 1, role: 1 } }).toArray(),
      appCtx.dbCtx.books.find({}).toArray(),
    ])

    return res.status(200).json(toEnrichedLoanResponse(loans, users, books))
  } catch (error) {
    console.error(`⚠ Loans: ${error}`)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}

function toEnrichedLoanResponse(
  loans: LoanDb[],
  users: Array<{ _id: LoanDb["userId"]; firstName: string; lastName: string; email: string; role: string }>,
  books: Array<{ _id: LoanDb["bookId"]; title: string; author: string; genre: string; totalCopies?: number; availableCopies?: number; available?: boolean; createdAt?: Date; updatedAt?: Date }>
) {
  const usersById = new Map(users.map((user) => [user._id.toHexString(), user]))
  const booksById = new Map(books.map((book) => [book._id.toHexString(), book]))

  return loans.map((loan) => {
    const user = usersById.get(loan.userId.toHexString())
    const book = booksById.get(loan.bookId.toHexString())

    return {
      ...toLoanResponse(loan),
      book: book
        ? toBookResponse(book)
        : null,
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
