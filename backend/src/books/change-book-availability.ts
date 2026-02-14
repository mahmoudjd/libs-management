import type { ObjectId } from "mongodb"
import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import type { AuthenticatedRequest } from "../types/http"
import { parseObjectId } from "../lib/object-id"

export const changeBookAvailability = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  const { bookId } = req.params
  const nextAvailability = req.body?.available

  if (nextAvailability !== undefined && typeof nextAvailability !== "boolean") {
    return res.status(400).json({ error: "available must be a boolean" })
  }

  const parsedBookId = parseObjectId(bookId)
  if (!parsedBookId) {
    return res.status(400).json({ error: "Invalid book ID" })
  }

  try {
    const success = await updateBookAvailabilityInDB(appCtx, parsedBookId, nextAvailability ?? true)
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
 * Update book availability in database
 * @param appCtx
 * @param bookId
 * @returns (Promise<boolean>)
 */
async function updateBookAvailabilityInDB(appCtx: AppContext, bookId: ObjectId, available: boolean) {
  const result = await appCtx.dbCtx.books.updateOne(
    { _id: bookId },
    { $set: { available } }
  )

  return result.matchedCount > 0
}
