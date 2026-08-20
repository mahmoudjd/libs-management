import { Request, Response } from "express"

import type { AppContext } from "../context/app-ctx"

/**
 * Distinct genres with a book count, so the catalogue filter can offer real
 * options instead of asking the user to guess a free-text value.
 */
export const getGenresHandler = (appCtx: AppContext) => async (_req: Request, res: Response) => {
  try {
    const rows = await appCtx.dbCtx.books
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$genre", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    const genres = rows
      .filter((row) => typeof row._id === "string" && row._id.trim() !== "")
      .map((row) => ({ genre: row._id, count: row.count }))

    return res.status(200).json(genres)
  } catch (error) {
    console.error(`⚠ Books: ${error}`)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
