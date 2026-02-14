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
            className={`p-6 bg-white rounded-xl shadow-md flex flex-col items-center justify-center ${onClick ? "cursor-pointer hover:shadow-lg" : ""}`}
            onClick={onClick}
        >
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <p className="text-3xl">{value}</p>
        </div>
    )
}

function isStaffKpis(
    kpis: DashboardKpis
): kpis is Extract<DashboardKpis, { role: "admin" | "librarian" }> {
    return kpis.role === "admin" || kpis.role === "librarian"
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
    const trendRangeButtons: Array<{ value: DashboardTrendRange; label: string }> = [
        { value: "1m", label: "1M" },
        { value: "3m", label: "3M" },
        { value: "1y", label: "1Y" },
    ]

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

                <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
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

                <div className="mt-8">
                    <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3 className="text-lg font-semibold">All Loans Trend</h3>
                        <div className="flex gap-2">
                            {trendRangeButtons.map((button) => (
                                <Button
                                    key={button.value}
                                    variant={selectedTrendRange === button.value ? "default" : "outline"}
                                    onClick={() => setSelectedTrendRange(button.value)}
                                >
                                    {button.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    {isLoanTrendsLoading ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
                            Loading loan trend chart...
                        </div>
                    ) : (loanTrendsError || !loanTrends) ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-red-600">
                            Failed to load loan trend chart.
                        </div>
                    ) : (
                        <LoanTrendsChart trends={loanTrends} />
                    )}
                </div>
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
                <div className="p-6 bg-white rounded-xl shadow-md flex flex-col justify-center">
                    <h2 className="text-lg font-semibold mb-2">User Info</h2>
                    <p className="text-sm">Name: {session?.user?.name}</p>
                    <p className="text-sm">Email: {session?.user?.email}</p>
                </div>
            </GridList>

            <div className="mt-8">
                <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h3 className="text-lg font-semibold">My Loans Trend</h3>
                    <div className="flex gap-2">
                        {trendRangeButtons.map((button) => (
                            <Button
                                key={button.value}
                                variant={selectedTrendRange === button.value ? "default" : "outline"}
                                onClick={() => setSelectedTrendRange(button.value)}
                            >
                                {button.label}
                            </Button>
                        ))}
                    </div>
                </div>
                {isLoanTrendsLoading ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
                        Loading loan trend chart...
                    </div>
                ) : (loanTrendsError || !loanTrends) ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-red-600">
                        Failed to load loan trend chart.
                    </div>
                ) : (
                    <LoanTrendsChart trends={loanTrends} />
                )}
            </div>
        </PageLayout>
    )
}
