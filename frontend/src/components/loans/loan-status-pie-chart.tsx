"use client"

import React, { useMemo } from "react"
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

type LoanStatusPieChartProps = {
  title: string
  subtitle?: string
  active: number
  overdue: number
  returned: number
}

type PiePoint = {
  key: "active" | "overdue" | "returned"
  label: string
  value: number
  color: string
}

function percentage(value: number, total: number) {
  if (total === 0) {
    return 0
  }
  return Math.round((value / total) * 100)
}

export const LoanStatusPieChart: React.FC<LoanStatusPieChartProps> = ({
  title,
  subtitle,
  active,
  overdue,
  returned,
}) => {
  const chartData = useMemo<PiePoint[]>(
    () => [
      { key: "active", label: "Active", value: active, color: "#2563eb" },
      { key: "overdue", label: "Overdue", value: overdue, color: "#ef4444" },
      { key: "returned", label: "Returned", value: returned, color: "#10b981" },
    ],
    [active, overdue, returned]
  )

  const total = active + overdue + returned

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      {total === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
          No loans to visualize yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] items-center">
          <div className="relative h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value) => [`${value ?? 0}`, "Loans"]}
                  contentStyle={{
                    borderRadius: "8px",
                    borderColor: "#e5e7eb",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="44%"
                  innerRadius={56}
                  outerRadius={92}
                  paddingAngle={2}
                  isAnimationActive={false}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center -translate-y-3">
                <p className="text-3xl font-semibold text-gray-900">{total}</p>
                <p className="text-xs text-gray-500">loans</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {chartData.map((point) => (
              <div
                key={point.key}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: point.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{point.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{point.value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentage(point.value, total)}%`,
                      backgroundColor: point.color,
                    }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-500">{percentage(point.value, total)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
