import { Request, Response } from 'express'
import type { AppContext } from '../context/app-ctx'
import { BookSchema, type BookDb } from '../types/types'
import { ObjectId } from 'mongodb'

/**
  * Update book handler
  * @param appCtx
  */
export const updateBookHandler = (appCtx: AppContext) => async (req: Request, res: Response) => {
  const { bookId } = req.params
  try {
    const parseResult = BookSchema.safeParse(req.body)
    if (!parseResult.success) {
      console.debug(
        `Invalid request body for method ${req.method} ${req.originalUrl} with error ${parseResult.error.toString()}`
      )
      return res.status(400).json(parseResult.error)
    }
    const updatedBook = parseResult.data
    const success = await updateBookInDB(appCtx, bookId, updatedBook)
    if (!success) {
      return res.status(404).json({ error: 'Book not found' })
    }
    return res.status(200).json({ message: 'Book updated successfully' })

  } catch (error) {
    console.error(`⚠ Books: ${error}`)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

/**
  * Update book by id in database
  * @param appCtx
  * @returns (Promise<boolean>)
  */
const updateBookInDB = async (appCtx: AppContext, bookId: string, updatedBook: BookDb) => {
  const success = await appCtx.dbCtx.books.updateOne({ _id: new ObjectId(bookId) },
    { "$set": { ...updatedBook } })

  return success.acknowledged
}
