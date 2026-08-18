"use client"

import React, { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import type { DashboardLoanTrends } from "@/lib/types"

type LoanTrendsChartProps = {
  trends: DashboardLoanTrends
}

type ChartPoint = {
  label: string
  loaned: number
  returned: number
  active: number
  overdue: number
}

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

function getXAxisInterval(pointsCount: number) {
  if (pointsCount > 24) {
    return 3
  }
  if (pointsCount > 16) {
    return 2
  }
  if (pointsCount > 8) {
    return 1
  }
  return 0
}

function StatsCard({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className: string
}) {
  return (
    <div className={`rounded-lg border p-3 ${className}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}

export const LoanTrendsChart: React.FC<LoanTrendsChartProps> = ({ trends }) => {
  const chartData = useMemo<ChartPoint[]>(
    () =>
      trends.points.map((point) => ({
        label: point.label,
        loaned: point.loanedCount,
        returned: point.returnedCount,
        active: point.activeOpenCount,
        overdue: point.overdueOpenCount,
      })),
    [trends.points]
  )

  const hasAnyData = useMemo(() => {
    return chartData.some(
      (point) => point.loaned > 0 || point.returned > 0 || point.active > 0 || point.overdue > 0
    )
  }, [chartData])

  const xAxisInterval = useMemo(() => getXAxisInterval(chartData.length), [chartData.length])

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-sm text-muted-foreground">No loan trend data available for this period.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Loan Activity Trend</h3>
          <p className="text-xs text-muted-foreground">
            {formatDateRange(trends.start, trends.end)} |{" "}
            {trends.granularity === "day" ? "Daily" : "Monthly"}
          </p>
        </div>
        <Badge variant="secondary">{trends.scope === "all" ? "All Loans" : "My Loans"}</Badge>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard
          label="Loaned In Range"
          value={trends.totals.loaned}
          className="border-transparent bg-primary-soft text-primary"
        />
        <StatsCard
          label="Returned In Range"
          value={trends.totals.returned}
          className="border-transparent bg-success-soft text-success"
        />
        <StatsCard
          label="Active Now"
          value={trends.totals.activeNow}
          className="border-transparent bg-warning-soft text-warning"
        />
        <StatsCard
          label="Overdue Now"
          value={trends.totals.overdueNow}
          className="border-transparent bg-danger-soft text-danger"
        />
      </div>

      {!hasAnyData && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-warning">
          No loan activity in this range yet. Try 3M or 1Y.
        </div>
      )}

      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient id="loanedArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-loaned)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-loaned)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="returnedArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-returned)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-returned)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="activeArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-active)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--chart-active)" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="overdueArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-overdue)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--chart-overdue)" stopOpacity={0.04} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
              axisLine={false}
              tickLine={false}
              interval={xAxisInterval}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--foreground)",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />

            <Area
              type="monotone"
              dataKey="loaned"
              name="Loaned"
              stroke="var(--chart-loaned)"
              fill="url(#loanedArea)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive
            />
            <Area
              type="monotone"
              dataKey="returned"
              name="Returned"
              stroke="var(--chart-returned)"
              fill="url(#returnedArea)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive
            />
            <Area
              type="monotone"
              dataKey="active"
              name="Active"
              stroke="var(--chart-active)"
              fill="url(#activeArea)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive
            />
            <Area
              type="monotone"
              dataKey="overdue"
              name="Overdue"
              stroke="var(--chart-overdue)"
              fill="url(#overdueArea)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
