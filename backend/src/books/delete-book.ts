import { Response } from "express"
import type { ObjectId } from "mongodb"

import type { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isStaff } from "../lib/authorization"
import { parseObjectId } from "../lib/object-id"
import type { AuthenticatedRequest } from "../types/http"

/**
 * Delete a book by ID
 * @param appCtx
 */
export const deleteBookHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { bookId } = req.params

  if (!isStaff(req.user)) {
    return res.status(403).json({ error: "Only staff can delete books" })
  }

  const parsedBookId = parseObjectId(bookId)
  if (!parsedBookId) {
    return res.status(400).json({ error: "Invalid book ID" })
  }

  try {
    const activeLoanCount = await appCtx.dbCtx.loans.countDocuments({
      bookId: parsedBookId,
      returnedAt: null,
    })

    if (activeLoanCount > 0) {
      return res.status(409).json({
        error: "Book has active loans and cannot be deleted",
      })
    }

    const deleted = await deleteBook(appCtx, parsedBookId)

    if (!deleted) {
      return res.status(404).json({ error: "Book not found" })
    }

    await appCtx.dbCtx.reservations.updateMany(
      {
        bookId: parsedBookId,
        status: "pending",
      },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      }
    )

    await writeAuditLog(appCtx, {
      action: "book.deleted",
      entityType: "book",
      entityId: parsedBookId.toHexString(),
      actor: req.user,
    })

    return res.status(200).json({ message: "Book deleted successfully" })
  } catch (error) {
    console.error(`⚠ Books: ${error}`)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}

const deleteBook = async (appCtx: AppContext, bookId: ObjectId) => {
  const result = await appCtx.dbCtx.books.deleteOne({ _id: bookId })
  return result.deletedCount > 0
}
