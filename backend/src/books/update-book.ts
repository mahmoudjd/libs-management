import { Response } from "express"
import type { ObjectId } from "mongodb"

import type { AppContext } from "../context/app-ctx"
import { BookSchema, type BookCreateOrUpdate } from "../types/types"
import type { AuthenticatedRequest } from "../types/http"
import { parseObjectId } from "../lib/object-id"

/**
  * Update book handler
  * @param appCtx
  */
export const updateBookHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { bookId } = req.params
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can update books" })
  }

  const parsedBookId = parseObjectId(bookId)
  if (!parsedBookId) {
    return res.status(400).json({ error: "Invalid book ID" })
  }

  try {
    const parseResult = BookSchema.safeParse(req.body)
    if (!parseResult.success) {
      console.debug(
        `Invalid request body for method ${req.method} ${req.originalUrl} with error ${parseResult.error.toString()}`
      )
      return res.status(400).json(parseResult.error)
    }

    const updatedBook = parseResult.data
    const success = await updateBookInDB(appCtx, parsedBookId, updatedBook)
    if (!success) {
      return res.status(404).json({ error: "Book not found" })
    }

    return res.status(200).json({ message: "Book updated successfully" })
  } catch (error) {
    console.error(`⚠ Books: ${error}`)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}

/**
 * Update book by id in database
 * @param appCtx
 * @param bookId
 * @param updatedBook
 * @returns (Promise<boolean>)
 */
const updateBookInDB = async (appCtx: AppContext, bookId: ObjectId, updatedBook: BookCreateOrUpdate) => {
  const result = await appCtx.dbCtx.books.updateOne(
    { _id: bookId },
    { $set: { ...updatedBook } }
  )

  return result.matchedCount > 0
}
