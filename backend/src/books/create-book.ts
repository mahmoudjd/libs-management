import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import type { AppContext } from '../context/app-ctx'
import { BookSchema } from '../types/types'

/**
  * Create a new book handler
  * @param appCtx
  */
export const createBookHandler = (appCtx: AppContext) => async (req: Request, res: Response) => {
  try {
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

