import { ObjectId } from "mongodb"

import type { AppContext } from "../context/app-ctx"
import type { AuthenticatedUser } from "../types/http"
import { LoanSchema, ReservationSchema, type LoanDb, type ReservationDb } from "../types/types"
import { writeAuditLog } from "../audit/audit-log"

const DEFAULT_RESERVATION_LOAN_DAYS = 14

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

export async function getNextPendingReservation(ctx: AppContext, bookId: ObjectId) {
  return ctx.dbCtx.reservations.findOne(
    { bookId, status: "pending" },
    { sort: { createdAt: 1 } }
  )
}

export async function hasPendingReservationForOtherUser(
  ctx: AppContext,
  bookId: ObjectId,
  userId: ObjectId
) {
  const nextReservation = await getNextPendingReservation(ctx, bookId)
  if (!nextReservation) {
    return false
  }
  return nextReservation.userId.toHexString() !== userId.toHexString()
}

export async function hasPendingReservationForUser(
  ctx: AppContext,
  bookId: ObjectId,
  userId: ObjectId
) {
  const reservation = await ctx.dbCtx.reservations.findOne({
    bookId,
    userId,
    status: "pending",
  })
  return reservation !== null
}

export async function fulfillPendingReservationForUser(
  ctx: AppContext,
  bookId: ObjectId,
  userId: ObjectId,
  actor?: AuthenticatedUser
) {
  const now = new Date()
  const updated = await ctx.dbCtx.reservations.findOneAndUpdate(
    {
      bookId,
      userId,
      status: "pending",
    },
    {
      $set: {
        status: "fulfilled",
        fulfilledAt: now,
      },
    },
    {
      sort: { createdAt: 1 },
      returnDocument: "after",
    }
  )

  if (updated) {
    await writeAuditLog(ctx, {
      action: "reservation.fulfilled",
      entityType: "reservation",
      entityId: updated._id.toHexString(),
      details: {
        bookId: bookId.toHexString(),
        userId: userId.toHexString(),
        mode: "manual-loan",
      },
      actor,
    })
  }

  return updated
}

export async function createPendingReservation(
  ctx: AppContext,
  input: { bookId: ObjectId; userId: ObjectId },
  actor?: AuthenticatedUser
) {
  const now = new Date()
  const parseResult = ReservationSchema.safeParse({
    bookId: input.bookId,
    userId: input.userId,
    createdAt: now,
    status: "pending",
    fulfilledAt: null,
    cancelledAt: null,
  })

  if (!parseResult.success) {
    return null
  }

  const reservation = parseResult.data
  const insertedId = new ObjectId()

  await ctx.dbCtx.reservations.insertOne({
    _id: insertedId,
    ...reservation,
  })

  await writeAuditLog(ctx, {
    action: "reservation.created",
    entityType: "reservation",
    entityId: insertedId.toHexString(),
    details: {
      bookId: input.bookId.toHexString(),
      userId: input.userId.toHexString(),
    },
    actor,
  })

  return {
    _id: insertedId,
    ...reservation,
  } satisfies ReservationDb
}

export async function cancelReservation(
  ctx: AppContext,
  reservationId: ObjectId,
  actor?: AuthenticatedUser
) {
  const now = new Date()
  const cancelled = await ctx.dbCtx.reservations.findOneAndUpdate(
    { _id: reservationId, status: "pending" },
    {
      $set: {
        status: "cancelled",
        cancelledAt: now,
      },
    },
    { returnDocument: "after" }
  )

  if (cancelled) {
    await writeAuditLog(ctx, {
      action: "reservation.cancelled",
      entityType: "reservation",
      entityId: cancelled._id.toHexString(),
      details: {
        bookId: cancelled.bookId.toHexString(),
        userId: cancelled.userId.toHexString(),
      },
      actor,
    })
  }

  return cancelled
}

export async function fulfillNextReservationIfPossible(
  ctx: AppContext,
  bookId: ObjectId,
  actor?: AuthenticatedUser
) {
  const nextReservation = await getNextPendingReservation(ctx, bookId)
  if (!nextReservation) {
    return null
  }

  const now = new Date()
  const updatedBook = await ctx.dbCtx.books.findOneAndUpdate(
    {
      _id: bookId,
      availableCopies: { $gt: 0 },
    },
    {
      $inc: { availableCopies: -1 },
      $set: { updatedAt: now },
    },
    {
      returnDocument: "after",
    }
  )

  if (!updatedBook) {
    return null
  }

  const fulfilledReservation = await ctx.dbCtx.reservations.findOneAndUpdate(
    {
      _id: nextReservation._id,
      status: "pending",
    },
    {
      $set: {
        status: "fulfilled",
        fulfilledAt: now,
      },
    },
    {
      returnDocument: "after",
    }
  )

  if (!fulfilledReservation) {
    await ctx.dbCtx.books.updateOne({ _id: bookId }, { $inc: { availableCopies: 1 } })
    return null
  }

  const loanParseResult = LoanSchema.safeParse({
    bookId,
    userId: fulfilledReservation.userId,
    loanDate: now,
    returnDate: addDays(now, DEFAULT_RESERVATION_LOAN_DAYS),
    returnedAt: null,
    extensionCount: 0,
    source: "reservation",
  })

  if (!loanParseResult.success) {
    await ctx.dbCtx.reservations.updateOne(
      { _id: fulfilledReservation._id },
      { $set: { status: "pending", fulfilledAt: null } }
    )
    await ctx.dbCtx.books.updateOne({ _id: bookId }, { $inc: { availableCopies: 1 } })
    return null
  }

  const loanData = loanParseResult.data
  const insertedLoanId = new ObjectId()

  try {
    await ctx.dbCtx.loans.insertOne({
      _id: insertedLoanId,
      ...loanData,
    })

    await writeAuditLog(ctx, {
      action: "reservation.fulfilled",
      entityType: "reservation",
      entityId: fulfilledReservation._id.toHexString(),
      details: {
        bookId: bookId.toHexString(),
        userId: fulfilledReservation.userId.toHexString(),
        loanId: insertedLoanId.toHexString(),
        mode: "auto-loan",
      },
      actor,
    })

    await writeAuditLog(ctx, {
      action: "loan.created",
      entityType: "loan",
      entityId: insertedLoanId.toHexString(),
      details: {
        bookId: bookId.toHexString(),
        userId: fulfilledReservation.userId.toHexString(),
        source: "reservation",
      },
      actor,
    })

    return {
      reservation: fulfilledReservation,
      loan: {
        _id: insertedLoanId,
        ...loanData,
      } satisfies LoanDb,
    }
  } catch (error) {
    await ctx.dbCtx.reservations.updateOne(
      { _id: fulfilledReservation._id },
      { $set: { status: "pending", fulfilledAt: null } }
    )
    await ctx.dbCtx.books.updateOne({ _id: bookId }, { $inc: { availableCopies: 1 } })
    throw error
  }
}
