import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isAdmin, isStaff } from "../lib/authorization"
import { buildCsv } from "../lib/csv"
import type { AuthenticatedRequest } from "../types/http"

function sendCsv(res: Response, filename: string, csv: string) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8")
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
  res.status(200).send(csv)
}

export const exportBooksCsvHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!isStaff(req.user)) {
    return res.status(403).json({ error: "Only staff can export books" })
  }

  try {
    const books = await appCtx.dbCtx.books.find({}).sort({ title: 1 }).toArray()
    const csv = buildCsv(
      ["id", "title", "author", "genre", "totalCopies", "availableCopies", "createdAt", "updatedAt"],
      books.map((book) => ({
        id: book._id.toHexString(),
        title: book.title,
        author: book.author,
        genre: book.genre,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        createdAt: book.createdAt?.toISOString(),
        updatedAt: book.updatedAt?.toISOString(),
      }))
    )

    await writeAuditLog(appCtx, {
      action: "export.books.csv",
      entityType: "book",
      details: { count: books.length },
      actor: req.user,
    })

    return sendCsv(res, "books.csv", csv)
  } catch (error) {
    console.error("Error exporting books csv:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const exportUsersCsvHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: "Only admins can export users" })
  }

  try {
    const users = await appCtx.dbCtx.users.find({}, { projection: { password: 0 } }).sort({ lastName: 1, firstName: 1 }).toArray()
    const csv = buildCsv(
      ["id", "firstName", "lastName", "email", "role"],
      users.map((user) => ({
        id: user._id.toHexString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }))
    )

    await writeAuditLog(appCtx, {
      action: "export.users.csv",
      entityType: "user",
      details: { count: users.length },
      actor: req.user,
    })

    return sendCsv(res, "users.csv", csv)
  } catch (error) {
    console.error("Error exporting users csv:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const exportLoansCsvHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!isStaff(req.user)) {
    return res.status(403).json({ error: "Only staff can export loans" })
  }

  try {
    const [loans, users, books] = await Promise.all([
      appCtx.dbCtx.loans.find({}).sort({ loanDate: -1 }).toArray(),
      appCtx.dbCtx.users.find({}, { projection: { firstName: 1, lastName: 1, email: 1 } }).toArray(),
      appCtx.dbCtx.books.find({}, { projection: { title: 1, author: 1 } }).toArray(),
    ])

    const usersById = new Map(users.map((user) => [user._id.toHexString(), user]))
    const booksById = new Map(books.map((book) => [book._id.toHexString(), book]))

    const csv = buildCsv(
      [
        "id",
        "bookId",
        "bookTitle",
        "bookAuthor",
        "userId",
        "userEmail",
        "userName",
        "loanDate",
        "dueDate",
        "returnedAt",
        "extensionCount",
        "source",
      ],
      loans.map((loan) => {
        const user = usersById.get(loan.userId.toHexString())
        const book = booksById.get(loan.bookId.toHexString())

        return {
          id: loan._id.toHexString(),
          bookId: loan.bookId.toHexString(),
          bookTitle: book?.title,
          bookAuthor: book?.author,
          userId: loan.userId.toHexString(),
          userEmail: user?.email,
          userName: user ? `${user.firstName} ${user.lastName}` : "",
          loanDate: loan.loanDate.toISOString(),
          dueDate: loan.returnDate.toISOString(),
          returnedAt: loan.returnedAt?.toISOString(),
          extensionCount: loan.extensionCount,
          source: loan.source,
        }
      })
    )

    await writeAuditLog(appCtx, {
      action: "export.loans.csv",
      entityType: "loan",
      details: { count: loans.length },
      actor: req.user,
    })

    return sendCsv(res, "loans.csv", csv)
  } catch (error) {
    console.error("Error exporting loans csv:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
