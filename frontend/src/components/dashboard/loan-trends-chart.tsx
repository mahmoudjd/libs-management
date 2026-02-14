import React, { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import type { DashboardLoanTrends } from "@/lib/types"

type LoanTrendsChartProps = {
  trends: DashboardLoanTrends
}

type SeriesKey = "loanedCount" | "returnedCount" | "activeOpenCount" | "overdueOpenCount"

type SeriesConfig = {
  key: SeriesKey
  label: string
  stroke: string
  fill: string
}

const GRID_STEPS = 4
const PLOT_WIDTH = 1000
const PLOT_HEIGHT = 220

const SERIES: SeriesConfig[] = [
  { key: "loanedCount", label: "Loaned", stroke: "#2563eb", fill: "rgba(37, 99, 235, 0.18)" },
  { key: "returnedCount", label: "Returned", stroke: "#10b981", fill: "rgba(16, 185, 129, 0.18)" },
  { key: "activeOpenCount", label: "Active", stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.14)" },
  { key: "overdueOpenCount", label: "Overdue", stroke: "#ef4444", fill: "rgba(239, 68, 68, 0.14)" },
]

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

function valueByKey(point: DashboardLoanTrends["points"][number], key: SeriesKey) {
  if (key === "loanedCount") {
    return point.loanedCount
  }
  if (key === "returnedCount") {
    return point.returnedCount
  }
  if (key === "activeOpenCount") {
    return point.activeOpenCount
  }
  return point.overdueOpenCount
}

function toLinePath(values: number[], maxValue: number) {
  if (values.length === 0) {
    return ""
  }

  if (values.length === 1) {
    const y = PLOT_HEIGHT - (values[0] / maxValue) * PLOT_HEIGHT
    return `M 0 ${y} L ${PLOT_WIDTH} ${y}`
  }

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * PLOT_WIDTH
      const y = PLOT_HEIGHT - (value / maxValue) * PLOT_HEIGHT
      return `${index === 0 ? "M" : "L"} ${x} ${y}`
    })
    .join(" ")
}

function toAreaPath(values: number[], maxValue: number) {
  if (values.length === 0) {
    return ""
  }

  const line = toLinePath(values, maxValue)
  if (values.length === 1) {
    return `${line} L ${PLOT_WIDTH} ${PLOT_HEIGHT} L 0 ${PLOT_HEIGHT} Z`
  }

  return `${line} L ${PLOT_WIDTH} ${PLOT_HEIGHT} L 0 ${PLOT_HEIGHT} Z`
}

function seriesColorBadge(stroke: string) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-sm"
      style={{ backgroundColor: stroke }}
    />
  )
}

export const LoanTrendsChart: React.FC<LoanTrendsChartProps> = ({ trends }) => {
  const { points } = trends

  const maxValue = useMemo(() => {
    const values = points.flatMap((point) => [
      point.loanedCount,
      point.returnedCount,
      point.activeOpenCount,
      point.overdueOpenCount,
    ])
    const max = Math.max(0, ...values)
    return max > 0 ? max : 1
  }, [points])

  const hasAnyData = useMemo(() => {
    return points.some((point) => (
      point.loanedCount > 0 ||
      point.returnedCount > 0 ||
      point.activeOpenCount > 0 ||
      point.overdueOpenCount > 0
    ))
  }, [points])

  const labelStep = useMemo(() => getLabelStep(points.length), [points.length])
  const chartMinWidth = useMemo(() => Math.max(720, points.length * 64), [points.length])

  const yAxisTicks = useMemo(() => {
    return Array.from({ length: GRID_STEPS + 1 }, (_, index) => {
      const ratio = 1 - index / GRID_STEPS
      const value = Math.round(maxValue * ratio)
      return { ratio, value }
    })
  }, [maxValue])

  const seriesPaths = useMemo(() => {
    return SERIES.map((series) => {
      const values = points.map((point) => valueByKey(point, series.key))
      return {
        ...series,
        linePath: toLinePath(values, maxValue),
        areaPath: toAreaPath(values, maxValue),
      }
    })
  }, [points, maxValue])

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
          <h4 className="text-base font-semibold text-gray-900">Loan Activity Trend</h4>
          <p className="text-xs text-gray-500">
            {formatDateRange(trends.start, trends.end)} | {trends.granularity === "day" ? "Daily" : "Monthly"}
          </p>
        </div>
        <Badge variant="secondary">{trends.scope === "all" ? "All Loans" : "My Loans"}</Badge>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs text-gray-600">Loaned In Range</p>
          <p className="text-2xl font-semibold text-blue-700">{trends.totals.loaned}</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-xs text-gray-600">Returned In Range</p>
          <p className="text-2xl font-semibold text-emerald-700">{trends.totals.returned}</p>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
          <p className="text-xs text-gray-600">Active Now</p>
          <p className="text-2xl font-semibold text-amber-700">{trends.totals.activeNow}</p>
        </div>
        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
          <p className="text-xs text-gray-600">Overdue Now</p>
          <p className="text-2xl font-semibold text-red-700">{trends.totals.overdueNow}</p>
        </div>
      </div>

      {!hasAnyData && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No loan activity in this range yet. Try 3M or 1Y.
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-3">
        {SERIES.map((series) => (
          <div key={series.key} className="inline-flex items-center gap-2 text-xs text-gray-600">
            {seriesColorBadge(series.stroke)}
            <span>{series.label}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${chartMinWidth}px` }}>
          <div className="grid grid-cols-[2.75rem_1fr] gap-2">
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

            <div className="relative h-72 rounded-lg border border-gray-200 bg-white px-2 pt-3 pb-9">
              <svg
                viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
                preserveAspectRatio="none"
                className="absolute inset-x-2 top-3 h-[calc(100%-3rem)] w-[calc(100%-1rem)]"
              >
                {yAxisTicks.map((tick) => (
                  <line
                    key={`grid-${tick.ratio}`}
                    x1={0}
                    x2={PLOT_WIDTH}
                    y1={tick.ratio * PLOT_HEIGHT}
                    y2={tick.ratio * PLOT_HEIGHT}
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                  />
                ))}

                {seriesPaths.map((series) => (
                  <path key={`${series.key}-area`} d={series.areaPath} fill={series.fill} />
                ))}

                {seriesPaths.map((series) => (
                  <path
                    key={`${series.key}-line`}
                    d={series.linePath}
                    fill="none"
                    stroke={series.stroke}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ))}
              </svg>

              <div
                className="absolute inset-x-2 top-3 bottom-9 grid"
                style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
              >
                {points.map((point) => (
                  <div key={point.key} className="group relative">
                    <div className="absolute inset-0" />
                    <div className="absolute left-1/2 top-2 z-20 hidden -translate-x-1/2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[10px] text-gray-700 shadow-md group-hover:block">
                      <p className="font-semibold">{point.label}</p>
                      <p>Loaned: {point.loanedCount}</p>
                      <p>Returned: {point.returnedCount}</p>
                      <p>Active: {point.activeOpenCount}</p>
                      <p>Overdue: {point.overdueOpenCount}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="absolute inset-x-2 bottom-1 grid"
                style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
              >
                {points.map((point, index) => {
                  const showLabel = index % labelStep === 0 || index === points.length - 1
                  return (
                    <div key={`${point.key}-label`} className="text-center text-[10px] text-gray-500">
                      {showLabel ? point.label : ""}
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
