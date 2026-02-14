"use client"

import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { LoanTrendsChart } from "@/components/dashboard/loan-trends-chart"
import { PageLayout } from "@/components/page-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GridList } from "@/components/ui/grid-list"
import { apiClient } from "@/lib/apiClient"
import { useDashboardKpis } from "@/lib/hooks/useDashboardKpis"
import { useDashboardLoanTrends } from "@/lib/hooks/useDashboardLoanTrends"
import type { DashboardKpis, DashboardTrendRange } from "@/lib/types"

function StatCard({
  title,
  value,
  onClick,
}: {
  title: string
  value: number
  onClick?: () => void
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition ${
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""
      }`}
      onClick={onClick}
    >
      <h2 className="text-sm font-medium text-gray-500 mb-2">{title}</h2>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function isStaffKpis(
  kpis: DashboardKpis
): kpis is Extract<DashboardKpis, { role: "admin" | "librarian" }> {
  return kpis.role === "admin" || kpis.role === "librarian"
}

function TrendRangeSelector({
  selectedRange,
  onSelectRange,
}: {
  selectedRange: DashboardTrendRange
  onSelectRange: (range: DashboardTrendRange) => void
}) {
  const options: Array<{ value: DashboardTrendRange; label: string }> = [
    { value: "1m", label: "1M" },
    { value: "3m", label: "3M" },
    { value: "1y", label: "1Y" },
  ]

  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelectRange(option.value)}
          className={`h-9 rounded-lg px-3 text-sm font-semibold transition ${
            selectedRange === option.value
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function TrendSection({
  title,
  subtitle,
  selectedRange,
  onSelectRange,
  isLoading,
  hasError,
  trends,
}: {
  title: string
  subtitle: string
  selectedRange: DashboardTrendRange
  onSelectRange: (range: DashboardTrendRange) => void
  isLoading: boolean
  hasError: boolean
  trends: ReturnType<typeof useDashboardLoanTrends>["data"]
}) {
  return (
    <section className="mt-8 rounded-2xl bg-gradient-to-br from-slate-100/70 to-white p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <TrendRangeSelector selectedRange={selectedRange} onSelectRange={onSelectRange} />
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
          Loading loan trend chart...
        </div>
      ) : hasError || !trends ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-red-600">
          Failed to load loan trend chart.
        </div>
      ) : (
        <LoanTrendsChart trends={trends} />
      )}
    </section>
  )
}

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: kpis, isLoading, error } = useDashboardKpis()
  const [exportingFile, setExportingFile] = useState<string | null>(null)
  const [selectedTrendRange, setSelectedTrendRange] = useState<DashboardTrendRange>("3m")
  const {
    data: loanTrends,
    isLoading: isLoanTrendsLoading,
    error: loanTrendsError,
  } = useDashboardLoanTrends(selectedTrendRange)

  const role = session?.user?.salesRole
  const isAdmin = role === "admin"

  const handleExport = async (filename: "books.csv" | "loans.csv" | "users.csv") => {
    try {
      setExportingFile(filename)
      const response = await apiClient.get(`/exports/${filename}`, {
        responseType: "blob",
      })

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } finally {
      setExportingFile(null)
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading Dashboard...</div>
  }

  if (error || !kpis) {
    return <div className="p-6">Failed to load dashboard.</div>
  }

  if (isStaffKpis(kpis)) {
    return (
      <PageLayout title={kpis.role === "admin" ? "Admin Dashboard" : "Librarian Dashboard"}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport("books.csv")}
            disabled={exportingFile !== null}
          >
            {exportingFile === "books.csv" ? "Exporting..." : "Export Books CSV"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("loans.csv")}
            disabled={exportingFile !== null}
          >
            {exportingFile === "loans.csv" ? "Exporting..." : "Export Loans CSV"}
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => handleExport("users.csv")}
              disabled={exportingFile !== null}
            >
              {exportingFile === "users.csv" ? "Exporting..." : "Export Users CSV"}
            </Button>
          )}
        </div>

        <GridList>
          <StatCard title="Total Books" value={kpis.totalBooks} onClick={() => router.push("/books")} />
          <StatCard title="Available Books" value={kpis.availableBooks} onClick={() => router.push("/books")} />
          <StatCard title="Total Users" value={kpis.totalUsers} onClick={() => router.push("/users")} />
          <StatCard title="Active Loans" value={kpis.activeLoans} onClick={() => router.push("/loans")} />
          <StatCard title="Overdue Loans" value={kpis.overdueLoans} onClick={() => router.push("/loans")} />
          <StatCard title="Pending Reservations" value={kpis.pendingReservations} onClick={() => router.push("/books")} />
        </GridList>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold mb-3">Top Genres</h3>
          <div className="flex flex-wrap gap-2">
            {kpis.topGenres.length === 0 ? (
              <span className="text-sm text-gray-500">No data available</span>
            ) : (
              kpis.topGenres.map((genre) => (
                <Badge key={genre.genre} variant="secondary">
                  {genre.genre}: {genre.count}
                </Badge>
              ))
            )}
          </div>
        </div>

        <TrendSection
          title="All Loans Trend"
          subtitle="Bar chart for loaned/returned, with lines for open/overdue trends."
          selectedRange={selectedTrendRange}
          onSelectRange={setSelectedTrendRange}
          isLoading={isLoanTrendsLoading}
          hasError={Boolean(loanTrendsError)}
          trends={loanTrends}
        />
      </PageLayout>
    )
  }

  const userKpis = kpis as Extract<DashboardKpis, { role: "user" }>

  return (
    <PageLayout title="User Dashboard">
      <GridList>
        <StatCard title="Total Books" value={userKpis.totalBooks} onClick={() => router.push("/books")} />
        <StatCard title="Available Books" value={userKpis.availableBooks} onClick={() => router.push("/books")} />
        <StatCard title="My Active Loans" value={userKpis.myActiveLoans} onClick={() => router.push("/loans")} />
        <StatCard title="My Overdue Loans" value={userKpis.myOverdueLoans} onClick={() => router.push("/loans")} />
        <StatCard title="My Pending Reservations" value={userKpis.myPendingReservations} onClick={() => router.push("/books")} />
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500 mb-2">User Info</h2>
          <p className="text-sm text-gray-800">Name: {session?.user?.name}</p>
          <p className="text-sm text-gray-800">Email: {session?.user?.email}</p>
        </div>
      </GridList>

      <TrendSection
        title="My Loans Trend"
        subtitle="Track your monthly or daily loan activity and due-risk trend."
        selectedRange={selectedTrendRange}
        onSelectRange={setSelectedTrendRange}
        isLoading={isLoanTrendsLoading}
        hasError={Boolean(loanTrendsError)}
        trends={loanTrends}
      />
    </PageLayout>
  )
}
