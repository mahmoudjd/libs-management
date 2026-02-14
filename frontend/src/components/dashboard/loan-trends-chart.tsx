import React, { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import type { DashboardLoanTrends } from "@/lib/types"

type LoanTrendsChartProps = {
  trends: DashboardLoanTrends
}

const GRID_STEPS = 4

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatDateRange(start: string, end: string) {
  return `${formatDate(start)} - ${formatDate(end)}`
}

function getLabelStep(pointsCount: number) {
  if (pointsCount > 24) {
    return 4
  }
  if (pointsCount > 16) {
    return 3
  }
  if (pointsCount > 10) {
    return 2
  }
  return 1
}

export const LoanTrendsChart: React.FC<LoanTrendsChartProps> = ({ trends }) => {
  const { points } = trends

  const maxVolumeValue = useMemo(() => {
    const max = Math.max(
      0,
      ...points.map((point) => point.loanedCount),
      ...points.map((point) => point.returnedCount)
    )
    return max > 0 ? max : 1
  }, [points])

  const maxOpenValue = useMemo(() => {
    const max = Math.max(
      0,
      ...points.map((point) => point.activeOpenCount),
      ...points.map((point) => point.overdueOpenCount)
    )
    return max > 0 ? max : 1
  }, [points])

  const labelStep = useMemo(() => getLabelStep(points.length), [points.length])

  const chartMinWidth = useMemo(() => {
    return Math.max(720, points.length * 54)
  }, [points.length])

  const openLoanLinePoints = useMemo(() => {
    const denominator = Math.max(1, points.length - 1)
    return points.map((point, index) => {
      const x = points.length === 1 ? 50 : (index / denominator) * 100
      const y = 100 - (point.activeOpenCount / maxOpenValue) * 100
      return `${x},${y}`
    }).join(" ")
  }, [points, maxOpenValue])

  const overdueLinePoints = useMemo(() => {
    const denominator = Math.max(1, points.length - 1)
    return points.map((point, index) => {
      const x = points.length === 1 ? 50 : (index / denominator) * 100
      const y = 100 - (point.overdueOpenCount / maxOpenValue) * 100
      return `${x},${y}`
    }).join(" ")
  }, [points, maxOpenValue])

  const yAxisTicks = useMemo(() => {
    return Array.from({ length: GRID_STEPS + 1 }, (_, index) => {
      const ratio = 1 - index / GRID_STEPS
      const value = Math.round(maxVolumeValue * ratio)
      return {
        ratio,
        value,
      }
    })
  }, [maxVolumeValue])

  if (points.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">No loan trend data available for this period.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-base font-semibold text-gray-900">Loans Overview</h4>
          <p className="text-xs text-gray-500">
            {formatDateRange(trends.start, trends.end)} | {trends.granularity === "day" ? "Daily" : "Monthly"} aggregation
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{trends.scope === "all" ? "All Loans" : "My Loans"}</Badge>
          <Badge variant="default">Loaned</Badge>
          <Badge variant="success">Returned</Badge>
          <Badge variant="warning">Open</Badge>
          <Badge variant="destructive">Overdue</Badge>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-gray-600">Loaned In Range</p>
          <p className="text-2xl font-semibold text-blue-700">{trends.totals.loaned}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3">
          <p className="text-xs text-gray-600">Returned In Range</p>
          <p className="text-2xl font-semibold text-emerald-700">{trends.totals.returned}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-gray-600">Active Now</p>
          <p className="text-2xl font-semibold text-slate-700">{trends.totals.activeNow}</p>
        </div>
        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-xs text-gray-600">Overdue Now</p>
          <p className="text-2xl font-semibold text-red-700">{trends.totals.overdueNow}</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div style={{ minWidth: `${chartMinWidth}px` }}>
          <div className="grid grid-cols-[3rem_1fr] gap-2">
            <div className="relative h-72">
              {yAxisTicks.map((tick) => (
                <div
                  key={`axis-${tick.ratio}`}
                  className="absolute right-0 -translate-y-1/2 text-[11px] text-gray-500"
                  style={{ top: `${tick.ratio * 100}%` }}
                >
                  {tick.value}
                </div>
              ))}
            </div>

            <div className="relative h-72 rounded-xl border border-gray-200 bg-gradient-to-b from-slate-50 to-white px-2 py-3">
              {yAxisTicks.map((tick) => (
                <div
                  key={`grid-${tick.ratio}`}
                  className="absolute left-2 right-2 border-t border-dashed border-gray-200"
                  style={{ top: `${tick.ratio * 100}%` }}
                />
              ))}

              <div className="absolute inset-x-2 bottom-9 top-3">
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full pointer-events-none">
                  <polyline
                    points={openLoanLinePoints}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points={overdueLinePoints}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="4 3"
                  />
                </svg>

                <div className="relative flex h-full items-end gap-1.5">
                  {points.map((point, index) => {
                    const loanedHeight = (point.loanedCount / maxVolumeValue) * 100
                    const returnedHeight = (point.returnedCount / maxVolumeValue) * 100
                    const showLabel = index % labelStep === 0 || index === points.length - 1

                    return (
                      <div key={point.key} className="group relative flex-1 min-w-[30px]">
                        <div className="flex h-full items-end justify-center gap-1">
                          <div
                            className="w-2.5 rounded-t bg-blue-500 transition-transform duration-200 group-hover:scale-y-105"
                            style={{ height: `${loanedHeight}%` }}
                          />
                          <div
                            className="w-2.5 rounded-t bg-emerald-500 transition-transform duration-200 group-hover:scale-y-105"
                            style={{ height: `${returnedHeight}%` }}
                          />
                        </div>
                        <div className="absolute -top-24 left-1/2 z-20 hidden -translate-x-1/2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[10px] text-gray-700 shadow-md group-hover:block">
                          <p className="font-semibold">{point.label}</p>
                          <p>Loaned: {point.loanedCount}</p>
                          <p>Returned: {point.returnedCount}</p>
                          <p>Open: {point.activeOpenCount}</p>
                          <p>Overdue: {point.overdueOpenCount}</p>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 w-14 -translate-x-1/2 text-center text-[10px] text-gray-500">
                          {showLabel ? point.label : ""}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
