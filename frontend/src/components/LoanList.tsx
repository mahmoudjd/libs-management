import React from "react"

import LoanCard from "./LoanCard"
import type { Loan } from "@/lib/types"
import { GridList } from "@/components/ui/grid-list"

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
        return <p className="text-center text-gray-500">Please log in to view your loans.</p>
    }

    if (loans.length === 0) {
        return <p className="text-center text-gray-500">{emptyStateText ?? "No loans found."}</p>
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
