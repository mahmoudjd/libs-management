import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { LoanDb } from "../types/types"
import type { AuthenticatedRequest } from "../types/http"

export const getLoansHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Not admin" })
    }

    const [loans, users, books] = await Promise.all([
      getLoans(appCtx),
      appCtx.dbCtx.users.find({}, { projection: { firstName: 1, lastName: 1, email: 1 } }).toArray(),
      appCtx.dbCtx.books.find({}, { projection: { title: 1, author: 1 } }).toArray(),
    ])

    const usersById = new Map(users.map((user) => [user._id.toHexString(), user]))
    const booksById = new Map(books.map((book) => [book._id.toHexString(), book]))

    const loansWithUsersInfo = loans.map((loan) => {
      const user = usersById.get(loan.userId.toHexString())
      const book = booksById.get(loan.bookId.toHexString())

      return {
        ...loan,
        book: {
          title: book?.title,
          author: book?.author,
        },
        user: {
          name: user ? `${user.firstName} ${user.lastName}` : "",
          email: user?.email,
        },
      }
    })

    return res.status(200).json(loansWithUsersInfo)
  } catch (error) {
    console.error(`⚠ Loans: ${error}`)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}

const getLoans = async (appCtx: AppContext): Promise<LoanDb[]> => {
  const cursor = appCtx.dbCtx.loans.find({})
  return cursor.toArray()
}
