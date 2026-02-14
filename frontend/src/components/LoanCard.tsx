import React from "react"

import type { Loan } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { toDEDateString } from "@/lib/helper/to-de-date-string";

type LoanCardProps = {
    loan: Loan
    onReturn: (loanId: string) => void
    onExtend: (loanId: string) => void
    isStaff: boolean
    isReturning?: boolean
    isExtending?: boolean
}

const MAX_EXTENSIONS = 2

const LoanCard: React.FC<LoanCardProps> = ({
    loan,
    onReturn,
    onExtend,
    isStaff,
    isReturning = false,
    isExtending = false,
}) => {
    const now = new Date()
    const isReturned = Boolean(loan.returnedAt)
    const isOverdue = loan.overdue || (!isReturned && new Date(loan.returnDate) < now)
    const daysUntilReturn = Math.floor((new Date(loan.returnDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isSoonDue = daysUntilReturn <= 3 && daysUntilReturn > 0
    const canExtend = !isReturned && !isOverdue && loan.extensionCount < MAX_EXTENSIONS

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col justify-between h-full">
                <div>
                    <Text variant="title">{loan.book?.title}</Text>
                    {(loan?.user && isStaff) && (
                        <Text variant="muted">Loaned by {loan.user.name}</Text>
                    )}
                    <Text variant="muted">
                        Borrowed: {toDEDateString(loan.loanDate)}
                    </Text>
                    <Text variant="muted" className="mb-4">
                        Due Date: {toDEDateString(loan.returnDate)}
                    </Text>
                    <Text variant="muted">Extensions: {loan.extensionCount}/{MAX_EXTENSIONS}</Text>
                    {isReturned && (
                        <Text variant="muted">Returned: {toDEDateString(loan.returnedAt!)}</Text>
                    )}
                </div>

                <div className="flex flex-col gap-3 mt-auto pt-3">
                    <Badge variant={isReturned ? "secondary" : isOverdue ? "destructive" : isSoonDue ? "warning" : "default"}>
                        {isReturned ? "Returned" : isOverdue ? "Overdue" : isSoonDue ? "Due soon" : "Active"}
                    </Badge>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            className="bg-green-600 hover:bg-green-700 transition text-white text-xs font-semibold px-4 py-2 rounded-full disabled:opacity-50"
                            onClick={() => onReturn(loan._id)}
                            disabled={isReturned || isReturning}
                        >
                            {isReturning ? "Returning..." : "Return Book"}
                        </Button>
                        <Button
                            variant="outline"
                            className="text-xs font-semibold px-4 py-2 rounded-full"
                            onClick={() => onExtend(loan._id)}
                            disabled={!canExtend || isExtending}
                        >
                            {isExtending ? "Extending..." : "Extend +7d"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default LoanCard
