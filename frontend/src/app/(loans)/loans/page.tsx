"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { BellAlertIcon } from "@heroicons/react/24/outline"

import LoanList from "@/components/LoanList"
import { LoanStatusPieChart } from "@/components/loans/loan-status-pie-chart"
import { PageLayout } from "@/components/page-layout"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { SkeletonCards } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"
import { useLoanCounts, useLoans, type LoanStatusFilter } from "@/lib/hooks/useLoans"

const PAGE_SIZE = 12

export default function LoansPage() {
    const { data: session, status: sessionStatus } = useSession()
    const role = session?.user?.salesRole
    const isStaff = role === "admin" || role === "librarian"

    const [statusFilter, setStatusFilter] = useState<LoanStatusFilter>("all")
    const [page, setPage] = useState(1)
    const [reminderResult, setReminderResult] = useState<string | null>(null)
    const [loanActionError, setLoanActionError] = useState<string | null>(null)

    const counts = useLoanCounts()
    const {
        loans,
        pagination,
        isLoading,
        isFetching,
        error: loansError,
        returnBook,
        extendLoan,
        prepareOverdueReminders,
        returningLoanId,
        extendingLoanId,
        isPreparingOverdueReminders,
    } = useLoans({ status: statusFilter, page, pageSize: PAGE_SIZE })

    useEffect(() => {
        setPage(1)
    }, [statusFilter])

    const handleReturn = async (loanId: string) => {
        try {
            setLoanActionError(null)
            await returnBook(loanId)
        } catch (error) {
            setLoanActionError(getApiErrorMessage(error, "Failed to return loan"))
        }
    }

    const handleExtend = async (loanId: string) => {
        try {
            setLoanActionError(null)
            await extendLoan(loanId, 7)
        } catch (error) {
            setLoanActionError(getApiErrorMessage(error, "Failed to extend loan"))
        }
    }

    const handlePrepareReminders = async () => {
        try {
            setLoanActionError(null)
            const response = await prepareOverdueReminders()
            setReminderResult(`${response.count} overdue reminders prepared`)
        } catch (error) {
            setLoanActionError(getApiErrorMessage(error, "Failed to prepare reminders"))
        }
    }

    const filterOptions: Array<{ value: LoanStatusFilter; label: string; count: number }> = [
        { value: "all", label: isStaff ? "All" : "My loans", count: counts.all },
        { value: "active", label: "Active", count: counts.active },
        { value: "overdue", label: "Overdue", count: counts.overdue },
        { value: "returned", label: "Returned", count: counts.returned },
    ]

    const showSkeleton = isLoading || sessionStatus === "loading"

    return (
        <PageLayout
            title={isStaff ? "All Loans" : "My Loans"}
            description={
                isStaff
                    ? "Track every active loan, chase overdue returns and extend due dates."
                    : "Everything you have borrowed, with due dates and extensions."
            }
            actions={
                isStaff && (
                    <Button
                        variant="outline"
                        onClick={handlePrepareReminders}
                        disabled={isPreparingOverdueReminders}
                    >
                        <BellAlertIcon aria-hidden="true" className="h-4 w-4" />
                        {isPreparingOverdueReminders ? "Preparing..." : "Prepare overdue reminders"}
                    </Button>
                )
            }
        >
            <div className="mb-6 flex flex-col gap-3">
                <SegmentedControl
                    label="Filter loans by status"
                    options={filterOptions}
                    value={statusFilter}
                    onChange={setStatusFilter}
                />
                {reminderResult && <Alert variant="success">{reminderResult}</Alert>}
            </div>

            <div className="mb-6">
                <LoanStatusPieChart
                    title="Loan status distribution"
                    subtitle={isStaff ? "All loans in the system" : "Your loans"}
                    active={counts.active}
                    overdue={counts.overdue}
                    returned={counts.returned}
                />
            </div>

            {loanActionError && (
                <Alert variant="error" className="mb-6">
                    {loanActionError}
                </Alert>
            )}

            {showSkeleton ? (
                <SkeletonCards count={3} />
            ) : loansError ? (
                // An unreachable API must not masquerade as "no loans match this filter".
                <Alert variant="error">
                    {getApiErrorMessage(loansError, "Could not load loans. Please try again.")}
                </Alert>
            ) : (
                <>
                    <div className={isFetching ? "opacity-60 transition-opacity" : undefined}>
                        <LoanList
                            loans={loans}
                            onReturn={handleReturn}
                            onExtend={handleExtend}
                            isLoggedIn={Boolean(session?.user)}
                            isStaff={isStaff}
                            returningLoanId={returningLoanId}
                            extendingLoanId={extendingLoanId}
                            emptyStateText="No loans match this filter."
                        />
                    </div>
                    {pagination && pagination.totalPages > 1 && (
                        <Pagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            total={pagination.total}
                            shownCount={loans.length}
                            itemLabel="loans"
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
        </PageLayout>
    )
}
