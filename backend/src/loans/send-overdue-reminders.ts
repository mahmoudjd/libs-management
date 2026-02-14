import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isStaff } from "../lib/authorization"
import type { AuthenticatedRequest } from "../types/http"

export const sendOverdueRemindersHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!isStaff(req.user)) {
    return res.status(403).json({ error: "Only staff can send overdue reminders" })
  }

  const now = new Date()

  try {
    const [overdueLoans, users, books] = await Promise.all([
      appCtx.dbCtx.loans.find({ returnedAt: null, returnDate: { $lt: now } }).toArray(),
      appCtx.dbCtx.users.find({}, { projection: { email: 1, firstName: 1, lastName: 1 } }).toArray(),
      appCtx.dbCtx.books.find({}, { projection: { title: 1 } }).toArray(),
    ])

    const usersById = new Map(users.map((user) => [user._id.toHexString(), user]))
    const booksById = new Map(books.map((book) => [book._id.toHexString(), book]))

    const reminders = overdueLoans.map((loan) => {
      const user = usersById.get(loan.userId.toHexString())
      const book = booksById.get(loan.bookId.toHexString())

      return {
        loanId: loan._id.toHexString(),
        userId: loan.userId.toHexString(),
        email: user?.email ?? "",
        name: user ? `${user.firstName} ${user.lastName}` : "",
        bookId: loan.bookId.toHexString(),
        bookTitle: book?.title ?? "",
        dueDate: loan.returnDate,
      }
    })

    await writeAuditLog(appCtx, {
      action: "loan.overdue.reminders.sent",
      entityType: "loan",
      details: {
        remindersCount: reminders.length,
      },
      actor: req.user,
    })

    return res.status(200).json({
      message: "Overdue reminders prepared successfully",
      count: reminders.length,
      reminders,
    })
  } catch (error) {
    console.error("Error preparing overdue reminders:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
