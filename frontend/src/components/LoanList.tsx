import React from 'react';
import LoanCard from './LoanCard';
import {Loan} from '@/lib/types';
import {GridList} from "@/components/ui/grid-list";

type LoanListProps = {
    loans: Loan[];
    onReturn: (loanId: string, bookId: string) => void;
    isLoggedIn: boolean;
};

const LoanList: React.FC<LoanListProps> = ({loans, onReturn, isLoggedIn}) => {
    if (!isLoggedIn) {
        return <p className="text-center text-gray-500">Please log in to view your loans.</p>;
    }

    if (loans.length === 0) {
        return <p className="text-center text-gray-500">You haven't borrowed any books yet.</p>;
    }

    return (
        <GridList>
            {loans.map((loan) => (
                <LoanCard key={loan._id} loan={loan} onReturn={onReturn}/>
            ))}
        </GridList>
    );
};

export default LoanList;
