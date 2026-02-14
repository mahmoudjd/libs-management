import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { apiClient } from "@/lib/apiClient"
import type { ApiMessageResponse, Book, Loan } from "@/lib/types"

const ALL_LOANS_QUERY_KEY = ["loans", "all"] as const
const OVERDUE_LOANS_QUERY_KEY = ["loans", "overdue"] as const
const userLoansQueryKey = (userId: string | undefined) => ["loans", "user", userId] as const
const BOOKS_QUERY_KEY = ["books"] as const

export const useLoans = (books: Book[]) => {
    const { data: session } = useSession()
    const queryClient = useQueryClient()

    const userId = session?.user?.id
    const role = session?.user?.salesRole
    const isStaff = role === "admin" || role === "librarian"

    const booksById = useMemo(() => {
        return new Map(books.map((book) => [book._id, book]))
    }, [books])

    const { data: allLoansRaw = [] } = useQuery<Loan[]>({
        queryKey: ALL_LOANS_QUERY_KEY,
        enabled: isStaff,
        queryFn: async () => {
            const response = await apiClient.get<Loan[]>("/loans")
            return response.data
        },
        staleTime: 30_000,
    })

    const {
        data: userLoansRaw = [],
        isLoading,
        error,
    } = useQuery<Loan[]>({
        queryKey: userLoansQueryKey(userId),
        enabled: Boolean(userId),
        queryFn: async () => {
            const response = await apiClient.get<Loan[]>(`/loans/${userId}`)
            return response.data
        },
        staleTime: 30_000,
    })

    const { data: overdueLoans = [] } = useQuery<Loan[]>({
        queryKey: OVERDUE_LOANS_QUERY_KEY,
        enabled: isStaff,
        queryFn: async () => {
            const response = await apiClient.get<Loan[]>("/loans/overdue")
            return response.data
        },
        staleTime: 30_000,
    })

    const allLoans = useMemo(() => {
        return allLoansRaw.map((loan) => ({
            ...loan,
            book: loan.book || booksById.get(loan.bookId),
        }))
    }, [allLoansRaw, booksById])

    const userLoans = useMemo(() => {
        return userLoansRaw.map((loan) => ({
            ...loan,
            book: loan.book || booksById.get(loan.bookId),
        }))
    }, [userLoansRaw, booksById])

    const borrowBookMutation = useMutation({
        mutationFn: async (data: { bookId: string; returnDate: Date }) => {
            if (!userId) {
                throw new Error("Missing userId")
            }

            const response = await apiClient.post<Loan>("/loans", {
                bookId: data.bookId,
                userId,
                returnDate: data.returnDate.toISOString(),
            })
            return response.data
        },
        onSuccess: () => {
            if (userId) {
                queryClient.invalidateQueries({ queryKey: userLoansQueryKey(userId) })
            }
            queryClient.invalidateQueries({ queryKey: ALL_LOANS_QUERY_KEY })
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
        },
    })

    const returnBookMutation = useMutation({
        mutationFn: async ({ loanId }: { loanId: string }) => {
            const response = await apiClient.put<ApiMessageResponse>(`/loans/${loanId}`, {})
            return response.data
        },
        onSuccess: () => {
            if (userId) {
                queryClient.invalidateQueries({ queryKey: userLoansQueryKey(userId) })
            }
            queryClient.invalidateQueries({ queryKey: ALL_LOANS_QUERY_KEY })
            queryClient.invalidateQueries({ queryKey: OVERDUE_LOANS_QUERY_KEY })
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
        },
    })

    const extendLoanMutation = useMutation({
        mutationFn: async ({ loanId, days }: { loanId: string; days?: number }) => {
            const response = await apiClient.put<ApiMessageResponse>(`/loans/${loanId}/extend`, {
                days,
            })
            return response.data
        },
        onSuccess: () => {
            if (userId) {
                queryClient.invalidateQueries({ queryKey: userLoansQueryKey(userId) })
            }
            queryClient.invalidateQueries({ queryKey: ALL_LOANS_QUERY_KEY })
            queryClient.invalidateQueries({ queryKey: OVERDUE_LOANS_QUERY_KEY })
        },
    })

    const prepareOverdueRemindersMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post<{ message: string; count: number }>("/loans/overdue/reminders")
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: OVERDUE_LOANS_QUERY_KEY })
        },
    })

    return {
        allLoans,
        userLoans,
        overdueLoans,
        isLoading,
        error,
        borrowBook: async (bookId: string, returnDate: Date) => {
            await borrowBookMutation.mutateAsync({ bookId, returnDate })
        },
        returnBook: async (loanId: string) => {
            await returnBookMutation.mutateAsync({ loanId })
        },
        extendLoan: async (loanId: string, days?: number) => {
            await extendLoanMutation.mutateAsync({ loanId, days })
        },
        prepareOverdueReminders: async () => {
            return prepareOverdueRemindersMutation.mutateAsync()
        },
        isBorrowingBook: borrowBookMutation.isPending,
        borrowingBookId: borrowBookMutation.isPending ? borrowBookMutation.variables?.bookId : undefined,
        isReturningBook: returnBookMutation.isPending,
        returningLoanId: returnBookMutation.isPending ? returnBookMutation.variables?.loanId : undefined,
        isExtendingLoan: extendLoanMutation.isPending,
        extendingLoanId: extendLoanMutation.isPending ? extendLoanMutation.variables?.loanId : undefined,
        isPreparingOverdueReminders: prepareOverdueRemindersMutation.isPending,
    }
}
