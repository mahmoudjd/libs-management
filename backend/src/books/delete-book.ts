import type { ObjectId } from "mongodb"
import { Response } from "express"

import type { AppContext } from "../context/app-ctx"
import type { AuthenticatedRequest } from "../types/http"
import { parseObjectId } from "../lib/object-id"

/**
 * Delete a book by ID
 * @param appCtx
 */
export const deleteBookHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { bookId } = req.params

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can delete books" })
  }

  const parsedBookId = parseObjectId(bookId)
  if (!parsedBookId) {
    return res.status(400).json({ error: "Invalid book ID" })
  }

  try {
    const deleted = await deleteBook(appCtx, parsedBookId)

    if (!deleted) {
      return res.status(404).json({ error: "Book not found" })
    }

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
