import React from 'react';
import {Loan} from '@/lib/types';
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Text} from "@/components/ui/text";

type LoanCardProps = {
    loan: Loan;
    onReturn: (loanId: string, bookId: string) => void;
};

const LoanCard: React.FC<LoanCardProps> = ({loan, onReturn}) => {

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
                        Borrowed: {new Date(loan.loanDate).toLocaleDateString("de-DE", {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    })}
                    </Text>
                    <Text variant="muted" className="mb-4">
                        Return Date: {new Date(loan.returnDate).toLocaleDateString("de-DE", {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    })}
                    </Text>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mt-auto">
                    <Badge variant="default">Loaned</Badge>

                    <Button
                        className="bg-green-600 hover:bg-green-700 transition text-white text-xs font-semibold px-4 py-2 rounded-full"
                        onClick={() => onReturn(loan._id, loan.bookId)}
                    >
                        Return Book
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default LoanCard;
