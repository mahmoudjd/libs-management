import React from 'react';
import { Loan } from '@/lib/types';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { toDEDateString } from "@/lib/helper/to-de-date-string";

type LoanCardProps = {
    loan: Loan;
    onReturn: (loanId: string) => void;
    isReturning?: boolean;
};

const LoanCard: React.FC<LoanCardProps> = ({ loan, onReturn, isReturning = false }) => {
    const now = new Date();
    const isOverdue = new Date(loan.returnDate) <= now;
    const daysUntilReturn = Math.floor((new Date(loan.returnDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isSoonDue = daysUntilReturn <= 3 && daysUntilReturn > 0;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col justify-between h-full">
                {/* Loan Info */}
                <div>
                    <Text variant="title">{loan.book?.title}</Text>
                    {loan?.user && (
                        <Text variant="muted">Loaned by {loan.user.name}</Text>
                    )}
                    <Text variant="muted">
                        Borrowed: {toDEDateString(loan.loanDate)}
                    </Text>
                    <Text variant="muted" className="mb-4">
                        Return Date: {toDEDateString(loan.returnDate)}
                    </Text>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-auto">
                    <Badge variant={isOverdue ? "destructive" : isSoonDue ? "warning" : "default"}>
                        {isOverdue ? "Overdue" : isSoonDue ? "Due soon" : "Loaned"}
                    </Badge>

                    <Button
                        className="bg-green-600 hover:bg-green-700 transition text-white text-xs font-semibold px-4 py-2 rounded-full disabled:opacity-50"
                        onClick={() => onReturn(loan._id)}
                        disabled={isOverdue || isReturning}
                    >
                        {isReturning ? "Returning..." : "Return Book"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default LoanCard;
