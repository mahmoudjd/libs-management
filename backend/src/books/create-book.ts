import { Response } from "express"
import { ObjectId } from "mongodb"

import type { AppContext } from "../context/app-ctx"
import { writeAuditLog } from "../audit/audit-log"
import { isStaff } from "../lib/authorization"
import { BookSchema } from "../types/types"
import type { AuthenticatedRequest } from "../types/http"
import { normalizeBookStock, toBookResponse } from "./book-stock"

/**
  * Create a new book handler
  * @param appCtx
  */
export const createBookHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ error: "Only staff can add books" })
    }

    const parseResult = BookSchema.safeParse(req.body)

    if (!parseResult.success) {
      console.debug(
        `Invalid request body for method ${req.method} ${req.originalUrl} with error ${parseResult.error.toString()}`,
      )
      return res.status(400).json(parseResult.error)
    }

    const parsedBook = parseResult.data
    const stock = normalizeBookStock(parsedBook)
    const now = new Date()

    const createdBook = {
      _id: new ObjectId(),
      title: parsedBook.title,
      author: parsedBook.author,
      genre: parsedBook.genre,
      totalCopies: stock.totalCopies,
      availableCopies: stock.availableCopies,
      createdAt: now,
      updatedAt: now,
    }

    await appCtx.dbCtx.books.insertOne(createdBook)

    await writeAuditLog(appCtx, {
      action: "book.created",
      entityType: "book",
      entityId: createdBook._id.toHexString(),
      details: {
        title: createdBook.title,
        author: createdBook.author,
        totalCopies: createdBook.totalCopies,
      },
      actor: req.user,
    })

    return res.status(201).json(toBookResponse(createdBook))
  } catch (error) {
    console.error(`⚠ Books: ${error}`)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
