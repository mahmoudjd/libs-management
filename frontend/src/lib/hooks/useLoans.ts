import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {useSession} from "next-auth/react";
import {Book, Loan} from "@/lib/types";
import {apiClient} from "@/lib/apiClient";

export const useLoans = (books: Book[]) => {
    const {data: session} = useSession();
    const queryClient = useQueryClient();
    const userId = session?.user?.id
    const isAdmin = session?.user?.salesRole === "admin";
    const {data: allLoans = []} = useQuery<Loan[]>({
        queryKey: ["loans"],
        enabled: isAdmin,
        queryFn: async () => {
            const response = await apiClient.get("/loans");
            return response.data;
        },
    })

    const {data: userLoans = [], isLoading, error} = useQuery<Loan[]>({
        queryKey: ["loans", userId],
        queryFn: async () => {
            const response = await apiClient.get(`/loans/${userId}`);

            return response.data.map((loan: Loan) => {
                const book = books.find((b) => b._id === loan.bookId);
                return {...loan, book};
            });
        },
    });

    const borrowBookMutation = useMutation({
        mutationFn: async (data: { bookId: string; returnDate: Date }) => {
            return await apiClient.post("/loans", {
                bookId: data.bookId,
                userId,
                loanDate: new Date(),
                returnDate: data.returnDate,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["loans", userId]});
            queryClient.invalidateQueries({queryKey: ["books"]});
        },
    });

    const returnBookMutation = useMutation({
        mutationFn: async ({loanId, bookId}: { loanId: string, bookId: string }) => {
            await apiClient.put(`/books/${bookId}/change-availability`)
            return await apiClient.put(`/loans/${loanId}`, {returnDate: new Date()});
        },
        onSuccess: async () => {
            queryClient.invalidateQueries({queryKey: ["loans", userId]});
            queryClient.invalidateQueries({queryKey: ["books"]});
        },
    });

    return {
        allLoans,
        userLoans,
        isLoading,
        error,
        borrowBook: async (bookId: string, returnDate: Date) => {
            await borrowBookMutation.mutateAsync({bookId, returnDate});
        },
        returnBook: async (loanId: string, bookId: string) => {
            await returnBookMutation.mutateAsync({loanId, bookId});
        },
    };
};
