"use client"

import React, { useMemo, useState } from "react"
import { useSession } from "next-auth/react"

import LoanList from "@/components/LoanList"
import { PageLayout } from "@/components/page-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
        await returnBook(loanId)
    }

    const handleExtend = async (loanId: string) => {
        await extendLoan(loanId, 7)
    }

    const handlePrepareReminders = async () => {
        const response = await prepareOverdueReminders()
        setReminderResult(`${response.count} overdue reminders prepared`)
    }

    const viewButtons: Array<{ key: LoanView; label: string; count: number }> = [
        { key: "all", label: isStaff ? "All" : "My Loans", count: counts.all },
        { key: "active", label: "Active", count: counts.active },
        { key: "overdue", label: "Overdue", count: counts.overdue },
        { key: "returned", label: "Returned", count: counts.returned },
    ]

    return (
        <PageLayout title={isStaff ? "All Loans" : "My Loans"}>
            <div className="mb-6 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                    {viewButtons.map((button) => (
                        <Button
                            key={button.key}
                            variant={selectedView === button.key ? "default" : "outline"}
                            onClick={() => setSelectedView(button.key)}
                        >
                            {button.label}
                            <span className="ml-2 text-xs">({button.count})</span>
                        </Button>
                    ))}
                </div>
                {isStaff && (
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handlePrepareReminders}
                            disabled={isPreparingOverdueReminders}
                        >
                            {isPreparingOverdueReminders ? "Preparing..." : "Prepare Overdue Reminders"}
                        </Button>
                        {counts.overdue > 0 && (
                            <Badge variant="destructive">{counts.overdue} overdue</Badge>
                        )}
                        {reminderResult && (
                            <span className="text-sm text-gray-600">{reminderResult}</span>
                        )}
                    </div>
                )}
            </div>

            {(booksLoading || loansLoading) ? (
                <p>Loading loans...</p>
            ) : (
                <LoanList
                    loans={visibleLoans}
                    onReturn={handleReturn}
                    onExtend={handleExtend}
                    isLoggedIn={Boolean(session?.user)}
                    isStaff={isStaff}
                    returningLoanId={returningLoanId}
                    extendingLoanId={extendingLoanId}
                    emptyStateText="No loans for this filter."
                />
            )}
        </PageLayout>
    )
}
