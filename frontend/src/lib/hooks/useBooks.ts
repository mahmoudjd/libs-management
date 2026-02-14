import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { ApiMessageResponse, Book, BookFormData } from "@/lib/types"

type SortBy = "title" | "author" | "genre" | "createdAt" | "availableCopies" | "totalCopies"
type SortOrder = "asc" | "desc"

export interface BooksQueryParams {
    q?: string
    genre?: string
    availableOnly?: boolean
    paginated?: boolean
    page?: number
    pageSize?: number
    sortBy?: SortBy
    order?: SortOrder
}

interface PaginatedBooksResponse {
    items: Book[]
    total: number
    page: number
    pageSize: number
}

const BOOKS_QUERY_ROOT = ["books"] as const

function normalizeParams(params?: BooksQueryParams) {
    return {
        q: params?.q?.trim() || undefined,
        genre: params?.genre?.trim() || undefined,
        availableOnly: params?.availableOnly || false,
        paginated: params?.paginated || false,
        page: params?.page || 1,
        pageSize: params?.pageSize || 12,
        sortBy: params?.sortBy || "createdAt",
        order: params?.order || "desc",
    } as const
}

function toApiParams(params: ReturnType<typeof normalizeParams>) {
    return {
        ...(params.q ? { q: params.q } : {}),
        ...(params.genre ? { genre: params.genre } : {}),
        ...(params.availableOnly ? { availableOnly: "true" } : {}),
        ...(params.paginated ? {
            paginated: "true",
            page: String(params.page),
            pageSize: String(params.pageSize),
            sortBy: params.sortBy,
            order: params.order,
        } : {}),
    }
}

export const useBooks = (params?: BooksQueryParams) => {
    const queryClient = useQueryClient()
    const normalizedParams = useMemo(() => normalizeParams(params), [params])

    const queryKey = useMemo(() => ([...BOOKS_QUERY_ROOT, normalizedParams] as const), [normalizedParams])

    const { data, isLoading, error } = useQuery<Book[] | PaginatedBooksResponse>({
        queryKey,
        queryFn: async () => {
            if (normalizedParams.paginated) {
                const response = await apiClient.get<PaginatedBooksResponse>("/books", {
                    params: toApiParams(normalizedParams),
                })
                return response.data
            }

            const response = await apiClient.get<Book[]>("/books", {
                params: toApiParams(normalizedParams),
            })
            return response.data
        },
        staleTime: 60_000,
    })

    const books = useMemo(() => {
        if (!data) {
            return []
        }

        if (Array.isArray(data)) {
            return data
        }

        return data.items
    }, [data])

    const pagination = useMemo(() => {
        if (!data || Array.isArray(data)) {
            return null
        }

        return {
            page: data.page,
            pageSize: data.pageSize,
            total: data.total,
            totalPages: Math.max(1, Math.ceil(data.total / data.pageSize)),
        }
    }, [data])

    const addBookMutation = useMutation({
        mutationFn: async (newBook: BookFormData) => {
            const response = await apiClient.post<Book>("/books", newBook)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_ROOT })
        },
    })

    const editBookMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: BookFormData }) => {
            const response = await apiClient.put<ApiMessageResponse>(`/books/${id}`, data)
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_ROOT })
        },
    })

    const deleteBookMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/books/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_ROOT })
        },
    })

    return {
        books,
        pagination,
        isLoading,
        error,
        addBook: addBookMutation.mutateAsync,
        editBook: editBookMutation.mutateAsync,
        deleteBook: deleteBookMutation.mutateAsync,
        isAddingBook: addBookMutation.isPending,
        isDeletingBook: deleteBookMutation.isPending,
        deletingBookId: deleteBookMutation.isPending ? deleteBookMutation.variables : undefined,
        isEditingBook: editBookMutation.isPending,
        editingBookId: editBookMutation.isPending ? editBookMutation.variables?.id : undefined,
    }
}
