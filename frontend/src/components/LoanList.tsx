import React from 'react';
import LoanCard from './LoanCard';
import { Loan } from '@/lib/types';

type LoanListProps = {
  loans: Loan[];
  onReturn: (loanId: string, bookId: string) => void;
  isLoggedIn: boolean;
};

const LoanList: React.FC<LoanListProps> = ({ loans, onReturn, isLoggedIn }) => {
  if (!isLoggedIn) {
    return <p className="text-center text-gray-500">Please log in to view your loans.</p>;
  }

  if (loans.length === 0) {
    return <p className="text-center text-gray-500">You haven't borrowed any books yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {loans.map((loan) => (
        <LoanCard key={loan._id} loan={loan} onReturn={onReturn} />
      ))}
    </div>
  );
};

export default LoanList;
