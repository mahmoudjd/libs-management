"use client"

import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  ArrowDownTrayIcon,
  BookOpenIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline"

import { LoanTrendsChart } from "@/components/dashboard/loan-trends-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { PageLayout } from "@/components/page-layout"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GridList } from "@/components/ui/grid-list"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Skeleton } from "@/components/ui/skeleton"
import { useCsvExport, type ExportFile } from "@/lib/hooks/useCsvExport"
import { useDashboardKpis } from "@/lib/hooks/useDashboardKpis"
import { useDashboardLoanTrends } from "@/lib/hooks/useDashboardLoanTrends"
import type { DashboardKpis, DashboardTrendRange } from "@/lib/types"
import { cn } from "@/lib/utils"

type StatTone = "primary" | "success" | "warning" | "danger"

const toneStyles: Record<StatTone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
}

function StatCard({
  title,
  value,
  Icon,
  tone = "primary",
  onClick,
}: {
  title: string
  value: number
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  tone?: StatTone
  onClick?: () => void
}) {
  const content = (
    <>
      <span className={cn("grid h-10 w-10 place-items-center rounded-xl", toneStyles[tone])}>
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      <span className="mt-4 block text-sm font-medium text-muted-foreground">{title}</span>
      <span className="mt-1 block text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</span>
    </>
  )

  const baseClassName =
    "rounded-2xl border border-border bg-surface p-5 text-left shadow-sm transition-shadow"

  // A clickable stat has to be a real button so keyboard users can reach it.
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          baseClassName,
          "cursor-pointer hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        {content}
      </button>
    )
  }

  return <div className={baseClassName}>{content}</div>
}

function isStaffKpis(
  kpis: DashboardKpis
): kpis is Extract<DashboardKpis, { role: "admin" | "librarian" }> {
  return kpis.role === "admin" || kpis.role === "librarian"
}

const trendRangeOptions: Array<{ value: DashboardTrendRange; label: string }> = [
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "1y", label: "1Y" },
]

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
    <Card className="mt-8">
      <CardContent>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <SegmentedControl
            label="Select trend range"
            options={trendRangeOptions}
            value={selectedRange}
            onChange={onSelectRange}
          />
        </div>

        {isLoading ? (
          <Skeleton className="h-[340px] w-full" />
        ) : hasError || !trends ? (
          <Alert variant="error">Failed to load the loan trend chart.</Alert>
        ) : (
          <LoanTrendsChart trends={trends} />
        )}
      </CardContent>
    </Card>
  )
}

function ExportButton({
  filename,
  label,
  exportingFile,
  onExport,
}: {
  filename: ExportFile
  label: string
  exportingFile: ExportFile | null
  onExport: (filename: ExportFile) => void
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onExport(filename)}
      disabled={exportingFile !== null}
    >
      <ArrowDownTrayIcon aria-hidden="true" className="h-4 w-4" />
      {exportingFile === filename ? "Exporting..." : label}
    </Button>
  )
}

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const { data: kpis, isLoading, error } = useDashboardKpis()
  const { exportFile, exportingFile, exportError } = useCsvExport()
  const [selectedTrendRange, setSelectedTrendRange] = useState<DashboardTrendRange>("3m")
  const {
    data: loanTrends,
    isLoading: isLoanTrendsLoading,
    error: loanTrendsError,
  } = useDashboardLoanTrends(selectedTrendRange)

  const role = session?.user?.salesRole
  const isAdmin = role === "admin"

  if (isLoading) {
    return (
      <PageLayout title="Dashboard">
        <GridList>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-2xl" />
          ))}
        </GridList>
      </PageLayout>
    )
  }

  if (error || !kpis) {
    return (
      <PageLayout title="Dashboard">
        <Alert variant="error">Failed to load the dashboard. Please refresh the page.</Alert>
      </PageLayout>
    )
  }

  if (isStaffKpis(kpis)) {
    return (
      <PageLayout
        title={kpis.role === "admin" ? "Admin Dashboard" : "Librarian Dashboard"}
        description="Key numbers across the whole library, plus CSV exports for reporting."
        actions={
          <>
            <ExportButton filename="books.csv" label="Books CSV" exportingFile={exportingFile} onExport={exportFile} />
            <ExportButton filename="loans.csv" label="Loans CSV" exportingFile={exportingFile} onExport={exportFile} />
            {isAdmin && (
              <ExportButton filename="users.csv" label="Users CSV" exportingFile={exportingFile} onExport={exportFile} />
            )}
          </>
        }
      >
        {exportError && (
          <Alert variant="error" className="mb-6">
            {exportError}
          </Alert>
        )}

        <GridList>
          <StatCard title="Total books" value={kpis.totalBooks} Icon={BookOpenIcon} onClick={() => router.push("/books")} />
          <StatCard title="Available books" value={kpis.availableBooks} Icon={CheckCircleIcon} tone="success" onClick={() => router.push("/books")} />
          <StatCard title="Total users" value={kpis.totalUsers} Icon={UsersIcon} onClick={() => router.push("/users")} />
          <StatCard title="Active loans" value={kpis.activeLoans} Icon={ClipboardDocumentListIcon} onClick={() => router.push("/loans")} />
          <StatCard title="Overdue loans" value={kpis.overdueLoans} Icon={ExclamationTriangleIcon} tone="danger" onClick={() => router.push("/loans")} />
          <StatCard title="Pending reservations" value={kpis.pendingReservations} Icon={BookmarkIcon} tone="warning" onClick={() => router.push("/reservations")} />
        </GridList>

        <Card className="mt-8">
          <CardContent>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Top genres</h2>
            <div className="flex flex-wrap gap-2">
              {kpis.topGenres.length === 0 ? (
                <span className="text-sm text-muted-foreground">No data available</span>
              ) : (
                kpis.topGenres.map((genre) => (
                  <Badge key={genre.genre} variant="secondary">
                    {genre.genre}: {genre.count}
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <TrendSection
          title="All loans trend"
          subtitle="Loaned, returned, active and overdue over time."
          selectedRange={selectedTrendRange}
          onSelectRange={setSelectedTrendRange}
          isLoading={isLoanTrendsLoading}
          hasError={Boolean(loanTrendsError)}
          trends={loanTrends}
        />

        {/* Audit logs are admin-only, so librarians do not get this card. */}
        {isAdmin && <RecentActivity enabled={isAdmin} />}
      </PageLayout>
    )
  }

  const userKpis = kpis as Extract<DashboardKpis, { role: "user" }>

  return (
    <PageLayout
      title="My Dashboard"
      description="Your borrowing activity at a glance."
    >
      <GridList>
        <StatCard title="Total books" value={userKpis.totalBooks} Icon={BookOpenIcon} onClick={() => router.push("/books")} />
        <StatCard title="Available books" value={userKpis.availableBooks} Icon={CheckCircleIcon} tone="success" onClick={() => router.push("/books")} />
        <StatCard title="My active loans" value={userKpis.myActiveLoans} Icon={ClipboardDocumentListIcon} onClick={() => router.push("/loans")} />
        <StatCard title="My overdue loans" value={userKpis.myOverdueLoans} Icon={ExclamationTriangleIcon} tone="danger" onClick={() => router.push("/loans")} />
        <StatCard title="My pending reservations" value={userKpis.myPendingReservations} Icon={BookmarkIcon} tone="warning" onClick={() => router.push("/books")} />
        <Card>
          <CardContent>
            <h2 className="text-sm font-medium text-muted-foreground">Account</h2>
            <p className="mt-2 text-sm text-foreground">{session?.user?.name}</p>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          </CardContent>
        </Card>
      </GridList>

      <TrendSection
        title="My loans trend"
        subtitle="Loaned, returned, active and overdue over time."
        selectedRange={selectedTrendRange}
        onSelectRange={setSelectedTrendRange}
        isLoading={isLoanTrendsLoading}
        hasError={Boolean(loanTrendsError)}
        trends={loanTrends}
      />
    </PageLayout>
  )
}
