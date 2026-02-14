import { ObjectId } from "mongodb"
import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { isStaff } from "../lib/authorization"
import type { AuthenticatedRequest } from "../types/http"

export const getDashboardKpisHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const now = new Date()

  try {
    if (isStaff(req.user)) {
      const [
        totalBooks,
        availableBooks,
        totalUsers,
        activeLoans,
        overdueLoans,
        pendingReservations,
        topGenres,
      ] = await Promise.all([
        appCtx.dbCtx.books.countDocuments({}),
        appCtx.dbCtx.books.countDocuments({ availableCopies: { $gt: 0 } }),
        appCtx.dbCtx.users.countDocuments({}),
        appCtx.dbCtx.loans.countDocuments({ returnedAt: null }),
        appCtx.dbCtx.loans.countDocuments({ returnedAt: null, returnDate: { $lt: now } }),
        appCtx.dbCtx.reservations.countDocuments({ status: "pending" }),
        appCtx.dbCtx.books.aggregate<{ _id: string; count: number }>([
          {
            $group: {
              _id: "$genre",
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
          {
            $limit: 5,
          },
        ]).toArray(),
      ])

      return res.status(200).json({
        role: req.user.role,
        totalBooks,
        availableBooks,
        totalUsers,
        activeLoans,
        overdueLoans,
        pendingReservations,
        topGenres: topGenres.map((genre) => ({
          genre: genre._id,
          count: genre.count,
        })),
      })
    }

    const userId = new ObjectId(req.user.id)

    const [
      totalBooks,
      availableBooks,
      myActiveLoans,
      myOverdueLoans,
      myPendingReservations,
    ] = await Promise.all([
      appCtx.dbCtx.books.countDocuments({}),
      appCtx.dbCtx.books.countDocuments({ availableCopies: { $gt: 0 } }),
      appCtx.dbCtx.loans.countDocuments({ userId, returnedAt: null }),
      appCtx.dbCtx.loans.countDocuments({ userId, returnedAt: null, returnDate: { $lt: now } }),
      appCtx.dbCtx.reservations.countDocuments({ userId, status: "pending" }),
    ])

    return res.status(200).json({
      role: req.user.role,
      totalBooks,
      availableBooks,
      myActiveLoans,
      myOverdueLoans,
      myPendingReservations,
    })
  } catch (error) {
    console.error("Error getting dashboard KPIs:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
