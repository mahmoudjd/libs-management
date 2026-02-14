import { Request, Response } from "express"
import type { Filter, Sort } from "mongodb"

import type { AppContext } from "../context/app-ctx"
import type { BookDb } from "../types/types"
import { hasPaginationQuery, parsePagination } from "../lib/pagination"
import { toBookResponse } from "./book-stock"

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function parseBoolean(value: unknown) {
  if (typeof value !== "string") {
    return false
  }
  return value === "true" || value === "1"
}

function getBookSort(query: Request["query"]): Sort {
  const sortByRaw = typeof query.sortBy === "string" ? query.sortBy : "createdAt"
  const orderRaw = typeof query.order === "string" ? query.order : "desc"

  const allowedSortFields: Record<string, string> = {
    title: "title",
    author: "author",
    genre: "genre",
    createdAt: "createdAt",
    availableCopies: "availableCopies",
    totalCopies: "totalCopies",
  }

  const sortField = allowedSortFields[sortByRaw] ?? "createdAt"
  const direction = orderRaw === "asc" ? 1 : -1
  return { [sortField]: direction }
}

function getBookFilter(query: Request["query"]): Filter<BookDb> {
  const q = typeof query.q === "string" ? query.q.trim() : ""
  const genre = typeof query.genre === "string" ? query.genre.trim() : ""
  const availableOnly = parseBoolean(query.availableOnly)

  const filter: Filter<BookDb> = {}

  if (q !== "") {
    const escapedQuery = escapeRegex(q)
    filter.$or = [
      { title: { $regex: escapedQuery, $options: "i" } },
      { author: { $regex: escapedQuery, $options: "i" } },
      { genre: { $regex: escapedQuery, $options: "i" } },
    ]
  }

  if (genre !== "") {
    filter.genre = { $regex: `^${escapeRegex(genre)}$`, $options: "i" }
  }

  if (availableOnly) {
    filter.availableCopies = { $gt: 0 }
  }

  return filter
}

/**
  * Get all books handler
  * @param appCtx
  */
export const getBooksHandler = (appCtx: AppContext) => async (req: Request, res: Response) => {
  try {
    const filter = getBookFilter(req.query)
    const sort = getBookSort(req.query)

    if (hasPaginationQuery(req.query as Record<string, unknown>)) {
      const { page, pageSize, skip } = parsePagination(req.query as Record<string, unknown>, {
        defaultPage: 1,
        defaultPageSize: 20,
        maxPageSize: 100,
      })

      const [books, total] = await Promise.all([
        appCtx.dbCtx.books.find(filter).sort(sort).skip(skip).limit(pageSize).toArray(),
        appCtx.dbCtx.books.countDocuments(filter),
      ])

      return res.status(200).json({
        items: books.map((book) => toBookResponse(book)),
        total,
        page,
        pageSize,
      })
    }

    const books = await getBooksFromDb(appCtx, filter, sort)
    return res.status(200).json(books)

  } catch (error) {
    console.error(`⚠ Books: ${error}`)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}

/**
  * Get all books from the database
  * @param appCtx
  * @returns {Promise<BookDb[]>}
  */
export const getBooksFromDb = async (
  appCtx: AppContext,
  filter: Filter<BookDb> = {},
  sort: Sort = { createdAt: -1 }
) => {
  const cursor = appCtx.dbCtx.books.find(filter).sort(sort)
  const books = await cursor.toArray()
  return books.map((book) => toBookResponse(book))
}
