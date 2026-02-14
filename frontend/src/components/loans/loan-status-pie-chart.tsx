import React, { useMemo } from "react"

type LoanStatusPieChartProps = {
  title: string
  subtitle?: string
  active: number
  overdue: number
  returned: number
}

type PieSlice = {
  key: "active" | "overdue" | "returned"
  label: string
  value: number
  color: string
  bgClassName: string
}

const PIE_SIZE = 230
const PIE_STROKE = 30
const PIE_RADIUS = (PIE_SIZE - PIE_STROKE) / 2
const PIE_CENTER = PIE_SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * PIE_RADIUS

function percentOf(value: number, total: number) {
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
  const slices: PieSlice[] = useMemo(() => [
    {
      key: "active",
      label: "Active",
      value: active,
      color: "#2563eb",
      bgClassName: "bg-blue-500",
    },
    {
      key: "overdue",
      label: "Overdue",
      value: overdue,
      color: "#ef4444",
      bgClassName: "bg-red-500",
    },
    {
      key: "returned",
      label: "Returned",
      value: returned,
      color: "#10b981",
      bgClassName: "bg-emerald-500",
    },
  ], [active, overdue, returned])

  const total = active + overdue + returned

  const segments = useMemo(() => {
    let offset = 0
    return slices.map((slice) => {
      const ratio = total > 0 ? slice.value / total : 0
      const dash = ratio * CIRCUMFERENCE
      const segment = {
        ...slice,
        ratio,
        dash,
        offset,
      }
      offset += dash
      return segment
    })
  }, [slices, total])

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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr] items-center">
          <div className="mx-auto">
            <svg width={PIE_SIZE} height={PIE_SIZE} viewBox={`0 0 ${PIE_SIZE} ${PIE_SIZE}`}>
              <circle
                cx={PIE_CENTER}
                cy={PIE_CENTER}
                r={PIE_RADIUS}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={PIE_STROKE}
              />
              <g transform={`rotate(-90 ${PIE_CENTER} ${PIE_CENTER})`}>
                {segments.map((segment) => {
                  if (segment.value === 0) {
                    return null
                  }
                  return (
                    <circle
                      key={segment.key}
                      cx={PIE_CENTER}
                      cy={PIE_CENTER}
                      r={PIE_RADIUS}
                      fill="none"
                      stroke={segment.color}
                      strokeWidth={PIE_STROKE}
                      strokeDasharray={`${segment.dash} ${CIRCUMFERENCE - segment.dash}`}
                      strokeDashoffset={-segment.offset}
                      strokeLinecap="butt"
                    />
                  )
                })}
              </g>
              <text
                x={PIE_CENTER}
                y={PIE_CENTER - 2}
                textAnchor="middle"
                className="fill-gray-900 text-3xl font-semibold"
              >
                {total}
              </text>
              <text
                x={PIE_CENTER}
                y={PIE_CENTER + 20}
                textAnchor="middle"
                className="fill-gray-500 text-xs"
              >
                loans
              </text>
            </svg>
          </div>

          <div className="space-y-2">
            {segments.map((segment) => (
              <div
                key={segment.key}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-sm ${segment.bgClassName}`} />
                    <span className="text-sm font-medium text-gray-700">{segment.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{segment.value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full ${segment.bgClassName}`}
                    style={{ width: `${percentOf(segment.value, total)}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-500">{percentOf(segment.value, total)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
