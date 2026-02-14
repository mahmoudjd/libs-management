import { Response } from "express"
import type { Filter } from "mongodb"

import { AppContext } from "../context/app-ctx"
import { isStaff } from "../lib/authorization"
import { parseObjectId } from "../lib/object-id"
import type { AuthenticatedRequest } from "../types/http"
import type { LoanDb } from "../types/types"

type LoanTrendRange = "1m" | "3m" | "1y"
type LoanTrendGranularity = "day" | "month"

interface TimeBucket {
  key: string
  label: string
  start: Date
  end: Date
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function parseRange(value: unknown): LoanTrendRange {
  if (value === "1m" || value === "3m" || value === "1y") {
    return value
  }
  return "3m"
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1, 0, 0, 0, 0)
}

function formatDayLabel(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${month}/${day}`
}

function formatMonthLabel(date: Date) {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`
}

function getBuckets(range: LoanTrendRange, now: Date) {
  if (range === "1m") {
    const start = startOfDay(addDays(now, -29))
    const buckets: TimeBucket[] = []

    for (let index = 0; index < 30; index += 1) {
      const bucketStart = startOfDay(addDays(start, index))
      const rawBucketEnd = endOfDay(bucketStart)
      const bucketEnd = rawBucketEnd.getTime() > now.getTime() ? now : rawBucketEnd

      buckets.push({
        key: bucketStart.toISOString().slice(0, 10),
        label: formatDayLabel(bucketStart),
        start: bucketStart,
        end: bucketEnd,
      })
    }

    return {
      range,
      granularity: "day" as LoanTrendGranularity,
      start,
      buckets,
    }
  }

  const monthCount = range === "3m" ? 3 : 12
  const start = startOfMonth(addMonths(now, -(monthCount - 1)))
  const buckets: TimeBucket[] = []

  for (let index = 0; index < monthCount; index += 1) {
    const bucketStart = startOfMonth(addMonths(start, index))
    const rawBucketEnd = endOfMonth(bucketStart)
    const bucketEnd = rawBucketEnd.getTime() > now.getTime() ? now : rawBucketEnd

    buckets.push({
      key: `${bucketStart.getFullYear()}-${String(bucketStart.getMonth() + 1).padStart(2, "0")}`,
      label: formatMonthLabel(bucketStart),
      start: bucketStart,
      end: bucketEnd,
    })
  }

  return {
    range,
    granularity: "month" as LoanTrendGranularity,
    start,
    buckets,
  }
}

function isWithinPeriod(date: Date | null | undefined, from: Date, to: Date) {
  if (!date) {
    return false
  }
  const timestamp = date.getTime()
  return timestamp >= from.getTime() && timestamp <= to.getTime()
}

function isActiveAtTime(loan: LoanDb, at: Date) {
  if (loan.loanDate.getTime() > at.getTime()) {
    return false
  }
  return !loan.returnedAt || loan.returnedAt.getTime() > at.getTime()
}

function isOverdueAtTime(loan: LoanDb, at: Date) {
  return isActiveAtTime(loan, at) && loan.returnDate.getTime() < at.getTime()
}

function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((acc, item) => acc + selector(item), 0)
}

export const getDashboardLoanTrendsHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const now = new Date()
  const range = parseRange(req.query.range)
  const { buckets, start, granularity } = getBuckets(range, now)
  const staffUser = isStaff(req.user)

  const filter: Filter<LoanDb> = {
    loanDate: { $lte: now },
    $or: [
      { loanDate: { $gte: start } },
      { returnedAt: null },
      { returnedAt: { $gte: start } },
    ],
  }

  if (!staffUser) {
    const parsedUserId = parseObjectId(req.user.id)
    if (!parsedUserId) {
      return res.status(400).json({ error: "Invalid user id in token" })
    }
    filter.userId = parsedUserId
  }

  try {
    const loans = await appCtx.dbCtx.loans.find(filter, {
      projection: {
        loanDate: 1,
        returnDate: 1,
        returnedAt: 1,
      },
    }).toArray()

    const points = buckets.map((bucket) => {
      const loanedCount = loans.filter((loan) => isWithinPeriod(loan.loanDate, bucket.start, bucket.end)).length
      const returnedCount = loans.filter((loan) => isWithinPeriod(loan.returnedAt, bucket.start, bucket.end)).length
      const activeOpenCount = loans.filter((loan) => isActiveAtTime(loan, bucket.end)).length
      const overdueOpenCount = loans.filter((loan) => isOverdueAtTime(loan, bucket.end)).length

      return {
        key: bucket.key,
        label: bucket.label,
        start: bucket.start,
        end: bucket.end,
        loanedCount,
        returnedCount,
        activeOpenCount,
        overdueOpenCount,
      }
    })

    const totals = {
      loaned: sumBy(points, (point) => point.loanedCount),
      returned: sumBy(points, (point) => point.returnedCount),
      activeNow: loans.filter((loan) => isActiveAtTime(loan, now)).length,
      overdueNow: loans.filter((loan) => isOverdueAtTime(loan, now)).length,
    }

    return res.status(200).json({
      role: req.user.role,
      scope: staffUser ? "all" : "mine",
      range,
      granularity,
      start,
      end: now,
      totals,
      points,
    })
  } catch (error) {
    console.error("Error getting dashboard loan trends:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
