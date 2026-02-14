"use client";

import React from "react";
import {useSession} from "next-auth/react";
import {useBooks} from "@/lib/hooks/useBooks";
import {useLoans} from "@/lib/hooks/useLoans";
import LoanList from "@/components/LoanList";
import {Button} from "@/components/ui/button";
import {PageLayout} from "@/components/page-layout";

export default function LoansPage() {
    const {data: session} = useSession();
    const isAdmin = session?.user?.salesRole === "admin";

    const {books, isLoading: booksLoading} = useBooks();
    const {
        allLoans,
        userLoans,
        isLoading: loansLoading,
        returnBook,
        returningLoanId,
        // borrowBook, // if new loans are added, this will be needed
    } = useLoans(books);

    const handleReturn = async (loanId: string) => {
        await returnBook(loanId);
    };
    return (
        <PageLayout title="Loans">
            {(booksLoading || loansLoading) ? (
                <p>Loading loans...</p>
            ) : (
                <LoanList
                    loans={isAdmin ? allLoans : userLoans}
                    onReturn={handleReturn}
                    isLoggedIn={!!session?.user}
                    returningLoanId={returningLoanId}
                />
            )}

        </PageLayout>
    );
}
