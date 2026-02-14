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
      <p className="text-xs text-gray-600">{label}</p>
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
          className="border-blue-100 bg-blue-50 text-blue-700"
        />
        <StatsCard
          label="Returned In Range"
          value={trends.totals.returned}
          className="border-emerald-100 bg-emerald-50 text-emerald-700"
        />
        <StatsCard
          label="Active Now"
          value={trends.totals.activeNow}
          className="border-amber-100 bg-amber-50 text-amber-700"
        />
        <StatsCard
          label="Overdue Now"
          value={trends.totals.overdueNow}
          className="border-red-100 bg-red-50 text-red-700"
        />
      </div>

      {!hasAnyData && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
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
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="returnedArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="activeArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="overdueArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.04} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              interval={xAxisInterval}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                borderColor: "#e5e7eb",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />

            <Area
              type="monotone"
              dataKey="loaned"
              name="Loaned"
              stroke="#2563eb"
              fill="url(#loanedArea)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="returned"
              name="Returned"
              stroke="#10b981"
              fill="url(#returnedArea)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="active"
              name="Active"
              stroke="#f59e0b"
              fill="url(#activeArea)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="overdue"
              name="Overdue"
              stroke="#ef4444"
              fill="url(#overdueArea)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
