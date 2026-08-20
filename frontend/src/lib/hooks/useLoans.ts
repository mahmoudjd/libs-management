import { useMemo } from "react"
import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { apiClient } from "@/lib/apiClient"
import type {
    CreateLoanResponse,
    Loan,
    LoanExtendResponse,
    LoanReturnResponse,
    OverdueRemindersResponse,
    PaginatedLoansResponse,
    PaginatedUserLoansResponse,
} from "@/lib/types"

export type LoanStatusFilter = "all" | "active" | "overdue" | "returned"

/** /loans returns EnrichedLoan, /loans/:userId returns UserLoan; both carry `book`. */
type LoanPage = PaginatedLoansResponse | PaginatedUserLoansResponse

const LOANS_QUERY_ROOT = ["loans"] as const
const BOOKS_QUERY_KEY = ["books"] as const

type UseLoansParams = {
    status?: LoanStatusFilter
    page?: number
    pageSize?: number
    /** Set false when the caller only needs the mutations. */
    enabled?: boolean
}

/** Staff see every loan; everyone else sees their own. */
function loansPath(isStaff: boolean, userId: string | undefined) {
    return isStaff ? "/loans" : `/loans/${userId}`
}

function toQueryParams(status: LoanStatusFilter, page: number, pageSize: number) {
    return {
        ...(status === "all" ? {} : { status }),
        paginated: "true",
        page: String(page),
        pageSize: String(pageSize),
    }
}

export const useLoans = (params: UseLoansParams = {}) => {
    const { data: session } = useSession()
    const queryClient = useQueryClient()

    const userId = session?.user?.id
    const role = session?.user?.salesRole
    const isStaff = role === "admin" || role === "librarian"

    const status = params.status ?? "all"
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 12
    const listEnabled = (params.enabled ?? true) && Boolean(userId)

    const {
        data,
        isLoading,
        isFetching,
        error,
    } = useQuery<LoanPage>({
        queryKey: [...LOANS_QUERY_ROOT, "list", { scope: isStaff ? "all" : userId, status, page, pageSize }],
        enabled: listEnabled,
        // Keeps the current page on screen while the next one loads.
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const response = await apiClient.get<LoanPage>(loansPath(isStaff, userId), {
                params: toQueryParams(status, page, pageSize),
            })
            return response.data
        },
        staleTime: 30_000,
    })

    const loans = (data?.items ?? []) as Loan[]
    const pagination = useMemo(() => {
        if (!data) {
            return null
        }
        return {
            page: data.page,
            pageSize: data.pageSize,
            total: data.total,
            totalPages: Math.max(1, Math.ceil(data.total / data.pageSize)),
        }
    }, [data])

    const invalidateLoans = () => {
        queryClient.invalidateQueries({ queryKey: LOANS_QUERY_ROOT })
        queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
    }

    const borrowBookMutation = useMutation({
        mutationFn: async (data: { bookId: string; returnDate: Date }) => {
            if (!userId) {
                throw new Error("Missing userId")
            }

            const response = await apiClient.post<CreateLoanResponse>("/loans", {
                bookId: data.bookId,
                userId,
                returnDate: data.returnDate.toISOString(),
            })
            return response.data
        },
        onSuccess: invalidateLoans,
    })

    const returnBookMutation = useMutation({
        mutationFn: async ({ loanId }: { loanId: string }) => {
            const response = await apiClient.put<LoanReturnResponse>(`/loans/${loanId}`, {})
            return response.data
        },
        onSuccess: invalidateLoans,
    })

    const extendLoanMutation = useMutation({
        mutationFn: async ({ loanId, days }: { loanId: string; days?: number }) => {
            const response = await apiClient.put<LoanExtendResponse>(`/loans/${loanId}/extend`, {
                days,
            })
            return response.data
        },
        onSuccess: invalidateLoans,
    })

    const prepareOverdueRemindersMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post<OverdueRemindersResponse>("/loans/overdue/reminders")
            return response.data
        },
        onSuccess: invalidateLoans,
    })

    return {
        loans,
        pagination,
        isLoading,
        isFetching,
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
        returningLoanId: returnBookMutation.isPending ? returnBookMutation.variables?.loanId : undefined,
        extendingLoanId: extendLoanMutation.isPending ? extendLoanMutation.variables?.loanId : undefined,
        isPreparingOverdueReminders: prepareOverdueRemindersMutation.isPending,
    }
}

const COUNTED_STATUSES = ["active", "overdue", "returned"] as const

/**
 * Totals per status. Server-side paging means the page itself can no longer
 * count, so each total comes from a countDocuments-backed query that fetches a
 * single row.
 */
export const useLoanCounts = () => {
    const { data: session } = useSession()
    const userId = session?.user?.id
    const role = session?.user?.salesRole
    const isStaff = role === "admin" || role === "librarian"

    const results = useQueries({
        queries: COUNTED_STATUSES.map((status) => ({
            queryKey: [...LOANS_QUERY_ROOT, "count", { scope: isStaff ? "all" : userId, status }],
            enabled: Boolean(userId),
            staleTime: 30_000,
            queryFn: async () => {
                const response = await apiClient.get<LoanPage>(loansPath(isStaff, userId), {
                    params: { status, paginated: "true", page: "1", pageSize: "1" },
                })
                return response.data.total
            },
        })),
    })

    const [active, overdue, returned] = results.map((result) => result.data ?? 0)

    return {
        active,
        overdue,
        returned,
        all: active + overdue + returned,
        isLoading: results.some((result) => result.isLoading),
    }
}
