"use client";

import React from "react";
import {useSession} from "next-auth/react";
import {useBooks} from "@/lib/hooks/useBooks";
import {useLoans} from "@/lib/hooks/useLoans";
import LoanList from "@/components/LoanList";
import {Button} from "@/components/ui/button";

export default function LoansPage() {
    const {data: session} = useSession();
    const isAdmin = session?.user?.salesRole === "admin";

    const {books, isLoading: booksLoading} = useBooks();
    const {
        allLoans,
        userLoans,
        isLoading: loansLoading,
        returnBook,
        // borrowBook, // if new loans are added, this will be needed
    } = useLoans(books);

    const handleReturn = async (loanId: string, bookId: string) => {
        await returnBook(loanId, bookId);
    };
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Loans</h1>
            </div>

            {(booksLoading || loansLoading) ? (
                <p>Loading loans...</p>
            ) : (
                <LoanList
                    loans={isAdmin? allLoans: userLoans}
                    onReturn={handleReturn}
                    isLoggedIn={!!session?.user}
                />
            )}

        </div>
    );
}
