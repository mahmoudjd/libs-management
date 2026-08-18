"use client"

import React, { useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { BellAlertIcon } from "@heroicons/react/24/outline"

import LoanList from "@/components/LoanList"
import { LoanStatusPieChart } from "@/components/loans/loan-status-pie-chart"
import { PageLayout } from "@/components/page-layout"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { SkeletonCards } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"
import { useBooks } from "@/lib/hooks/useBooks"
import { useLoans } from "@/lib/hooks/useLoans"

type LoanView = "all" | "active" | "overdue" | "returned"

export default function LoansPage() {
    const { data: session } = useSession()
    const role = session?.user?.salesRole
    const isStaff = role === "admin" || role === "librarian"

    const { books, isLoading: booksLoading } = useBooks()
    const {
        allLoans,
        overdueLoans,
        userLoans,
        isLoading: loansLoading,
        returnBook,
        extendLoan,
        prepareOverdueReminders,
        returningLoanId,
        extendingLoanId,
        isPreparingOverdueReminders,
    } = useLoans(books)

    const [selectedView, setSelectedView] = useState<LoanView>(isStaff ? "all" : "active")
    const [reminderResult, setReminderResult] = useState<string | null>(null)
    const [loanActionError, setLoanActionError] = useState<string | null>(null)

    const baseLoans = isStaff ? allLoans : userLoans
    const visibleLoans = useMemo(() => {
        if (selectedView === "all") {
            return baseLoans
        }
        if (selectedView === "overdue") {
            return isStaff ? overdueLoans : baseLoans.filter((loan) => loan.status === "overdue")
        }
        return baseLoans.filter((loan) => loan.status === selectedView)
    }, [baseLoans, overdueLoans, isStaff, selectedView])

    const counts = useMemo(() => {
        const active = baseLoans.filter((loan) => loan.status === "active").length
        const overdue = baseLoans.filter((loan) => loan.status === "overdue").length
        const returned = baseLoans.filter((loan) => loan.status === "returned").length
        return {
            all: baseLoans.length,
            active,
            overdue,
            returned,
        }
    }, [baseLoans])

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

    const viewOptions: Array<{ value: LoanView; label: string; count: number }> = [
        { value: "all", label: isStaff ? "All" : "My loans", count: counts.all },
        { value: "active", label: "Active", count: counts.active },
        { value: "overdue", label: "Overdue", count: counts.overdue },
        { value: "returned", label: "Returned", count: counts.returned },
    ]

    const isLoading = booksLoading || loansLoading

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
                    options={viewOptions}
                    value={selectedView}
                    onChange={setSelectedView}
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

            {isLoading ? (
                <SkeletonCards count={3} />
            ) : (
                <LoanList
                    loans={visibleLoans}
                    onReturn={handleReturn}
                    onExtend={handleExtend}
                    isLoggedIn={Boolean(session?.user)}
                    isStaff={isStaff}
                    returningLoanId={returningLoanId}
                    extendingLoanId={extendingLoanId}
                    emptyStateText="No loans match this filter."
                />
            )}
        </PageLayout>
    )
}
