import React from "react"

import type { Loan } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toDEDateString } from "@/lib/helper/to-de-date-string";

type LoanCardProps = {
    loan: Loan
    onReturn?: (loanId: string) => void
    onExtend?: (loanId: string) => void
    isStaff: boolean
    isReturning?: boolean
    isExtending?: boolean
    /** Renders the card without actions, for views that only report on a loan. */
    readOnly?: boolean
}

const MAX_EXTENSIONS = 2

function getDueLabel(daysUntilReturn: number) {
    if (daysUntilReturn === 0) {
        return "due today"
    }
    if (daysUntilReturn < 0) {
        return `${Math.abs(daysUntilReturn)} day(s) overdue`
    }
    return `in ${daysUntilReturn} day(s)`
}

const LoanCard: React.FC<LoanCardProps> = ({
    loan,
    onReturn,
    onExtend,
    isStaff,
    isReturning = false,
    isExtending = false,
    readOnly = false,
}) => {
    const now = new Date()
    const isReturned = Boolean(loan.returnedAt)
    const isOverdue = loan.overdue || (!isReturned && new Date(loan.returnDate) < now)
    const daysUntilReturn = Math.floor((new Date(loan.returnDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isSoonDue = daysUntilReturn <= 3 && daysUntilReturn > 0
    const canExtend = !isReturned && !isOverdue && loan.extensionCount < MAX_EXTENSIONS

    const status = isReturned
        ? { variant: "secondary" as const, label: "Returned" }
        : isOverdue
            ? { variant: "destructive" as const, label: "Overdue" }
            : isSoonDue
                ? { variant: "warning" as const, label: "Due soon" }
                : { variant: "default" as const, label: "Active" }

    return (
        <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold leading-snug text-foreground">
                            {loan.book?.title ?? "Unknown book"}
                        </h3>
                        {loan.user && isStaff && (
                            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                Loaned by {loan.user.name}
                            </p>
                        )}
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                        <dt className="text-xs text-muted-foreground">Borrowed</dt>
                        <dd className="text-foreground">{toDEDateString(loan.loanDate)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-muted-foreground">Due date</dt>
                        <dd className={isOverdue && !isReturned ? "font-semibold text-danger" : "text-foreground"}>
                            {toDEDateString(loan.returnDate)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-muted-foreground">Extensions</dt>
                        <dd className="text-foreground">{loan.extensionCount}/{MAX_EXTENSIONS}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-muted-foreground">
                            {isReturned ? "Returned" : "Remaining"}
                        </dt>
                        <dd className="text-foreground">
                            {isReturned ? toDEDateString(loan.returnedAt!) : getDueLabel(daysUntilReturn)}
                        </dd>
                    </div>
                </dl>

                {!readOnly && onReturn && onExtend && (
                    <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onExtend(loan._id)}
                            disabled={!canExtend || isExtending}
                            title={canExtend ? undefined : "Extension not possible for this loan"}
                        >
                            {isExtending ? "Extending..." : "Extend +7d"}
                        </Button>
                        <Button
                            variant="success"
                            size="sm"
                            onClick={() => onReturn(loan._id)}
                            disabled={isReturned || isReturning}
                        >
                            {isReturning ? "Returning..." : "Return book"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default LoanCard
