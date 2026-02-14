import { Response } from 'express'
import { ObjectId } from "mongodb";
import type { AppContext } from '../context/app-ctx'
import { BookSchema } from '../types/types'
import type { AuthenticatedRequest } from '../types/http'

/**
  * Create a new book handler
  * @param appCtx
  */
export const createBookHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can add books" });
    }

    const parseResult = BookSchema.safeParse(req.body)

    if (!parseResult.success) {
      console.debug(
        `Invalid request body for method ${req.method} ${req.originalUrl} with error ${parseResult.error.toString()}`,
      )
      return res.status(400).json(parseResult.error)
    }

    const book = parseResult.data
    const result = await appCtx.dbCtx.books.insertOne({
      ...book,
      _id: new ObjectId()
    })

    return res.status(201).json({
      _id: result.insertedId,
      ...book
    })
  } catch (error) {
    console.error(`⚠ Books: ${error}`)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
