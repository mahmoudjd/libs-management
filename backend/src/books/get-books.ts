import { Request, Response } from 'express'
import type { AppContext } from '../context/app-ctx'
import type { BookDb } from '../types/types'

/**
  * Get all books handler
  * @param appCtx
  */
export const getBooksHandler = (appCtx: AppContext) => async (req: Request, res: Response) => {
  try {
    const books = await getBooksFromDb(appCtx)
    return res.status(200).json(books)

  } catch (error) {
    console.error(`⚠ Books: ${error}`)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

/**
  * Get all books from the database
  * @param appCtx
  * @returns {Promise<BookDb[]>}
  */
export const getBooksFromDb = async (appCtx: AppContext): Promise<BookDb[]> => {
  const cursor = appCtx.dbCtx.books.find({})
  const books = await cursor.toArray()
  return books
}
