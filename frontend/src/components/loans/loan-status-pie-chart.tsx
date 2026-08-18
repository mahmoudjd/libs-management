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
      { key: "active", label: "Active", value: active, color: "var(--chart-loaned)" },
      { key: "overdue", label: "Overdue", value: overdue, color: "var(--chart-overdue)" },
      { key: "returned", label: "Returned", value: returned, color: "var(--chart-returned)" },
    ],
    [active, overdue, returned]
  )

  const total = active + overdue + returned

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {total === 0 ? (
        <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
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
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface)",
                    color: "var(--foreground)",
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
                  isAnimationActive
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center -translate-y-3">
                <p className="text-3xl font-semibold text-foreground">{total}</p>
                <p className="text-xs text-muted-foreground">loans</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {chartData.map((point) => (
              <div
                key={point.key}
                className="rounded-lg border border-border bg-surface-muted px-3 py-2"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: point.color }}
                    />
                    <span className="text-sm font-medium text-foreground">{point.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{point.value}</span>
                </div>
                <div className="h-2 rounded-full bg-border">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentage(point.value, total)}%`,
                      backgroundColor: point.color,
                    }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{percentage(point.value, total)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
