import React from "react"

import LoanCard from "./LoanCard"
import type { Loan } from "@/lib/types"
import { GridList } from "@/components/ui/grid-list"
import { EmptyState } from "@/components/ui/empty-state"

type LoanListProps = {
    loans: Loan[]
    onReturn: (loanId: string) => void
    onExtend: (loanId: string) => void
    isLoggedIn: boolean
    isStaff: boolean
    returningLoanId?: string
    extendingLoanId?: string
    emptyStateText?: string
}

const LoanList: React.FC<LoanListProps> = ({
    loans,
    onReturn,
    onExtend,
    isLoggedIn,
    isStaff,
    returningLoanId,
    extendingLoanId,
    emptyStateText,
}) => {
    if (!isLoggedIn) {
        return (
            <EmptyState
                title="You are not signed in"
                description="Log in to see the books you have borrowed."
            />
        )
    }

    if (loans.length === 0) {
        return (
            <EmptyState
                title="No loans found"
                description={emptyStateText ?? "Nothing matches this filter yet."}
            />
        )
    }

    return (
        <GridList>
            {loans.map((loan) => (
                <LoanCard
                    key={loan._id}
                    loan={loan}
                    onReturn={onReturn}
                    onExtend={onExtend}
                    isStaff={isStaff}
                    isReturning={returningLoanId === loan._id}
                    isExtending={extendingLoanId === loan._id}
                />
            ))}
        </GridList>
    )
}

export default LoanList
