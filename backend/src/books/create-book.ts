import { ObjectId } from 'mongodb'
import { Response } from 'express'
import type { AppContext } from '../context/app-ctx'
import { BookSchema } from '../types/types'

/**
  * Create a new book handler
  * @param appCtx
  */
export const createBookHandler = (appCtx: AppContext) => async (req: any, res: Response) => {
  try {
    if (!req?.user || req?.user.role !== "admin") {
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

    return res.status(201).json(result)
  } catch (error) {
    console.error(`⚠ Books: ${error}`)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

