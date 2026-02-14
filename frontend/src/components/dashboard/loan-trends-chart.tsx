import React, { useMemo } from "react"

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
  if (pointsCount > 20) {
    return 3
  }
  if (pointsCount > 12) {
    return 2
  }
  return 1
}

function LegendItem({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-gray-600">
      <span className={`h-2.5 w-2.5 rounded-sm ${colorClass}`} />
      <span>{label}</span>
    </div>
  )
}

function StatItem({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: number
  valueClassName: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-3">
      <p className="text-xs text-gray-600">{label}</p>
      <p className={`text-2xl font-semibold ${valueClassName}`}>{value}</p>
    </div>
  )
}

export const LoanTrendsChart: React.FC<LoanTrendsChartProps> = ({ trends }) => {
  const { points } = trends
  const hasRangeActivity = trends.totals.loaned > 0 || trends.totals.returned > 0

  const maxBarValue = useMemo(() => {
    const max = Math.max(
      0,
      ...points.map((point) => point.loanedCount),
      ...points.map((point) => point.returnedCount)
    )
    return max > 0 ? max : 1
  }, [points])

  const labelStep = useMemo(() => getLabelStep(points.length), [points.length])

  const chartMinWidth = useMemo(() => {
    return Math.max(640, points.length * 44)
  }, [points.length])

  const yAxisTicks = useMemo(() => {
    return Array.from({ length: GRID_STEPS + 1 }, (_, index) => {
      const ratio = 1 - index / GRID_STEPS
      const value = Math.round(maxBarValue * ratio)
      return {
        ratio,
        value,
      }
    })
  }, [maxBarValue])

  if (points.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">No loan trend data available for this period.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-base font-semibold text-gray-900">Loan Activity</h4>
          <p className="text-xs text-gray-500">
            {formatDateRange(trends.start, trends.end)} | {trends.granularity === "day" ? "Daily" : "Monthly"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <LegendItem colorClass="bg-blue-500" label="Loaned" />
          <LegendItem colorClass="bg-emerald-500" label="Returned" />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatItem label="Loaned In Range" value={trends.totals.loaned} valueClassName="text-blue-700" />
        <StatItem label="Returned In Range" value={trends.totals.returned} valueClassName="text-emerald-700" />
        <StatItem label="Active Now" value={trends.totals.activeNow} valueClassName="text-slate-700" />
        <StatItem label="Overdue Now" value={trends.totals.overdueNow} valueClassName="text-red-700" />
      </div>

      {!hasRangeActivity && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No loan activity in this range yet. Try 3M or 1Y to see more data.
        </div>
      )}

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${chartMinWidth}px` }}>
          <div className="grid grid-cols-[2.5rem_1fr] gap-2">
            <div className="relative h-64">
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

            <div className="relative h-64 rounded-lg border border-gray-200 bg-white px-2 pt-3 pb-8">
              {yAxisTicks.map((tick) => (
                <div
                  key={`grid-${tick.ratio}`}
                  className="absolute left-2 right-2 border-t border-dashed border-gray-200"
                  style={{ top: `${tick.ratio * 100}%` }}
                />
              ))}

              <div className="absolute inset-x-2 bottom-8 top-3 flex items-end gap-1">
                {points.map((point, index) => {
                  const loanedHeight = (point.loanedCount / maxBarValue) * 100
                  const returnedHeight = (point.returnedCount / maxBarValue) * 100
                  const showLabel = index % labelStep === 0 || index === points.length - 1

                  return (
                    <div key={point.key} className="group relative flex-1 min-w-[24px]">
                      <div className="flex h-full items-end justify-center gap-1">
                        <div
                          className="w-2.5 rounded-t bg-blue-500"
                          style={{ height: `${loanedHeight}%` }}
                          title={`${point.label} | Loaned: ${point.loanedCount}`}
                        />
                        <div
                          className="w-2.5 rounded-t bg-emerald-500"
                          style={{ height: `${returnedHeight}%` }}
                          title={`${point.label} | Returned: ${point.returnedCount}`}
                        />
                      </div>
                      <div className="absolute -bottom-7 left-1/2 w-14 -translate-x-1/2 text-center text-[10px] text-gray-500">
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
  )
}
