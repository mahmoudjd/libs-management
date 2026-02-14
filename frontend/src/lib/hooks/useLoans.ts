import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { apiClient } from "@/lib/apiClient"
import type { ApiMessageResponse, Book, Loan } from "@/lib/types"

const ALL_LOANS_QUERY_KEY = ["loans", "all"] as const
const userLoansQueryKey = (userId: string | undefined) => ["loans", "user", userId] as const
const BOOKS_QUERY_KEY = ["books"] as const

export const useLoans = (books: Book[]) => {
    const { data: session } = useSession()
    const queryClient = useQueryClient()
    const userId = session?.user?.id
    const isAdmin = session?.user?.salesRole === "admin"

    const booksById = useMemo(() => {
        return new Map(books.map((book) => [book._id, book]))
    }, [books])

    const { data: allLoansRaw = [] } = useQuery<Loan[]>({
        queryKey: ALL_LOANS_QUERY_KEY,
        enabled: isAdmin,
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
                loanDate: new Date().toISOString(),
                returnDate: data.returnDate.toISOString(),
            })
            return response.data
        },
        onMutate: async ({ bookId, returnDate }) => {
            if (!userId) {
                return undefined
            }

            await Promise.all([
                queryClient.cancelQueries({ queryKey: BOOKS_QUERY_KEY }),
                queryClient.cancelQueries({ queryKey: userLoansQueryKey(userId) }),
                queryClient.cancelQueries({ queryKey: ALL_LOANS_QUERY_KEY }),
            ])

            const previousBooks = queryClient.getQueryData<Book[]>(BOOKS_QUERY_KEY)
            const previousUserLoans = queryClient.getQueryData<Loan[]>(userLoansQueryKey(userId))
            const previousAllLoans = queryClient.getQueryData<Loan[]>(ALL_LOANS_QUERY_KEY)

            const targetBook = previousBooks?.find((book) => book._id === bookId)
            const nowIso = new Date().toISOString()
            const optimisticLoan: Loan = {
                _id: `tmp-${bookId}-${Date.now()}`,
                bookId,
                userId,
                loanDate: nowIso,
                returnDate: returnDate.toISOString(),
                book: targetBook,
                user: {
                    id: userId,
                    name: session?.user?.name,
                    firstName: session?.user?.firstName,
                    lastName: session?.user?.lastName,
                    email: session?.user?.email,
                    role: session?.user?.salesRole === "admin" ? "admin" : "user",
                    accessToken: session?.user?.accessToken,
                },
            }

            queryClient.setQueryData<Book[]>(BOOKS_QUERY_KEY, (current) => {
                if (!current) {
                    return current
                }
                return current.map((book) => (
                    book._id === bookId
                        ? {
                            ...book,
                            available: false,
                        }
                        : book
                ))
            })

            queryClient.setQueryData<Loan[]>(userLoansQueryKey(userId), (current) => {
                if (!current) {
                    return [optimisticLoan]
                }
                return [optimisticLoan, ...current]
            })

            if (isAdmin) {
                queryClient.setQueryData<Loan[]>(ALL_LOANS_QUERY_KEY, (current) => {
                    if (!current) {
                        return [optimisticLoan]
                    }
                    return [optimisticLoan, ...current]
                })
            }

            return { previousBooks, previousUserLoans, previousAllLoans }
        },
        onError: (_error, _variables, context) => {
            if (!userId || !context) {
                return
            }

            if (context.previousBooks) {
                queryClient.setQueryData(BOOKS_QUERY_KEY, context.previousBooks)
            }
            if (context.previousUserLoans) {
                queryClient.setQueryData(userLoansQueryKey(userId), context.previousUserLoans)
            }
            if (context.previousAllLoans) {
                queryClient.setQueryData(ALL_LOANS_QUERY_KEY, context.previousAllLoans)
            }
        },
        onSettled: () => {
            if (userId) {
                queryClient.invalidateQueries({ queryKey: userLoansQueryKey(userId) })
            }
            queryClient.invalidateQueries({ queryKey: ALL_LOANS_QUERY_KEY })
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
        },
    })

    const returnBookMutation = useMutation({
        mutationFn: async ({ loanId }: { loanId: string }) => {
            const response = await apiClient.put<ApiMessageResponse>(`/loans/${loanId}`, {
                returnDate: new Date().toISOString(),
            })
            return response.data
        },
        onMutate: async ({ loanId }) => {
            if (!userId) {
                return undefined
            }

            await Promise.all([
                queryClient.cancelQueries({ queryKey: BOOKS_QUERY_KEY }),
                queryClient.cancelQueries({ queryKey: userLoansQueryKey(userId) }),
                queryClient.cancelQueries({ queryKey: ALL_LOANS_QUERY_KEY }),
            ])

            const previousBooks = queryClient.getQueryData<Book[]>(BOOKS_QUERY_KEY)
            const previousUserLoans = queryClient.getQueryData<Loan[]>(userLoansQueryKey(userId))
            const previousAllLoans = queryClient.getQueryData<Loan[]>(ALL_LOANS_QUERY_KEY)
            const nowIso = new Date().toISOString()

            const targetLoan = previousUserLoans?.find((loan) => loan._id === loanId)
                || previousAllLoans?.find((loan) => loan._id === loanId)

            queryClient.setQueryData<Loan[]>(userLoansQueryKey(userId), (current) => {
                if (!current) {
                    return current
                }

                return current.map((loan) => (
                    loan._id === loanId
                        ? {
                            ...loan,
                            returnDate: nowIso,
                        }
                        : loan
                ))
            })

            queryClient.setQueryData<Loan[]>(ALL_LOANS_QUERY_KEY, (current) => {
                if (!current) {
                    return current
                }

                return current.map((loan) => (
                    loan._id === loanId
                        ? {
                            ...loan,
                            returnDate: nowIso,
                        }
                        : loan
                ))
            })

            if (targetLoan?.bookId) {
                queryClient.setQueryData<Book[]>(BOOKS_QUERY_KEY, (current) => {
                    if (!current) {
                        return current
                    }

                    return current.map((book) => (
                        book._id === targetLoan.bookId
                            ? {
                                ...book,
                                available: true,
                            }
                            : book
                    ))
                })
            }

            return { previousBooks, previousUserLoans, previousAllLoans }
        },
        onError: (_error, _variables, context) => {
            if (!userId || !context) {
                return
            }

            if (context.previousBooks) {
                queryClient.setQueryData(BOOKS_QUERY_KEY, context.previousBooks)
            }
            if (context.previousUserLoans) {
                queryClient.setQueryData(userLoansQueryKey(userId), context.previousUserLoans)
            }
            if (context.previousAllLoans) {
                queryClient.setQueryData(ALL_LOANS_QUERY_KEY, context.previousAllLoans)
            }
        },
        onSettled: () => {
            if (userId) {
                queryClient.invalidateQueries({ queryKey: userLoansQueryKey(userId) })
            }
            queryClient.invalidateQueries({ queryKey: ALL_LOANS_QUERY_KEY })
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
        },
    })

    const borrowingBookId = borrowBookMutation.isPending ? borrowBookMutation.variables?.bookId : undefined
    const returningLoanId = returnBookMutation.isPending ? returnBookMutation.variables?.loanId : undefined

    return {
        allLoans,
        userLoans,
        isLoading,
        error,
        borrowBook: async (bookId: string, returnDate: Date) => {
            await borrowBookMutation.mutateAsync({ bookId, returnDate })
        },
        returnBook: async (loanId: string) => {
            await returnBookMutation.mutateAsync({ loanId })
        },
        isBorrowingBook: borrowBookMutation.isPending,
        borrowingBookId,
        isReturningBook: returnBookMutation.isPending,
        returningLoanId,
    }
}
