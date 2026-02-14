import React, { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import type { DashboardLoanTrends } from "@/lib/types"

type LoanTrendsChartProps = {
  trends: DashboardLoanTrends
}

export const LoanTrendsChart: React.FC<LoanTrendsChartProps> = ({ trends }) => {
  const { points } = trends

  const maxBarValue = useMemo(() => {
    const max = Math.max(
      0,
      ...points.map((point) => point.loanedCount),
      ...points.map((point) => point.returnedCount)
    )
    return max > 0 ? max : 1
  }, [points])

  if (points.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">No loan trend data available for this period.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-md bg-blue-50 p-3">
          <p className="text-xs text-gray-600">Loaned In Range</p>
          <p className="text-xl font-semibold text-blue-700">{trends.totals.loaned}</p>
        </div>
        <div className="rounded-md bg-emerald-50 p-3">
          <p className="text-xs text-gray-600">Returned In Range</p>
          <p className="text-xl font-semibold text-emerald-700">{trends.totals.returned}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <p className="text-xs text-gray-600">Active Now</p>
          <p className="text-xl font-semibold text-slate-700">{trends.totals.activeNow}</p>
        </div>
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-xs text-gray-600">Overdue Now</p>
          <p className="text-xl font-semibold text-red-700">{trends.totals.overdueNow}</p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Badge variant="default">Loaned</Badge>
        <Badge variant="success">Returned</Badge>
        <Badge variant="secondary">{trends.scope === "all" ? "All Loans" : "My Loans"}</Badge>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[740px]">
          <div className="h-56 flex items-end gap-3 border-b border-gray-200 px-1">
            {points.map((point) => {
              const loanedHeight = (point.loanedCount / maxBarValue) * 100
              const returnedHeight = (point.returnedCount / maxBarValue) * 100

              return (
                <div key={point.key} className="flex-1 min-w-[36px]">
                  <div className="h-44 flex items-end justify-center gap-1">
                    <div
                      className="w-2.5 rounded-t bg-blue-500"
                      style={{ height: `${loanedHeight}%` }}
                      title={`${point.label}: ${point.loanedCount} loaned`}
                    />
                    <div
                      className="w-2.5 rounded-t bg-emerald-500"
                      style={{ height: `${returnedHeight}%` }}
                      title={`${point.label}: ${point.returnedCount} returned`}
                    />
                  </div>
                  <div className="mt-2 text-center text-[11px] text-gray-600">{point.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
