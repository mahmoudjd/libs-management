import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { ApiMessageResponse, Book, BookFormData } from "@/lib/types"

const BOOKS_QUERY_KEY = ["books"] as const

export const useBooks = () => {
    const queryClient = useQueryClient()

    const { data: books = [], isLoading, error } = useQuery<Book[]>({
        queryKey: BOOKS_QUERY_KEY,
        queryFn: async () => {
            const response = await apiClient.get<Book[]>("/books")
            return response.data
        },
        staleTime: 60_000,
    })

    const addBookMutation = useMutation({
        mutationFn: async (newBook: BookFormData) => {
            const response = await apiClient.post<Book>("/books", newBook)
            return response.data
        },
        onSuccess: (createdBook) => {
            queryClient.setQueryData<Book[]>(BOOKS_QUERY_KEY, (current) => {
                if (!current) {
                    return [createdBook]
                }
                return [createdBook, ...current]
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
        },
    })

    const editBookMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: BookFormData }) => {
            const response = await apiClient.put<ApiMessageResponse>(`/books/${id}`, data)
            return response.data
        },
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: BOOKS_QUERY_KEY })
            const previousBooks = queryClient.getQueryData<Book[]>(BOOKS_QUERY_KEY)

            queryClient.setQueryData<Book[]>(BOOKS_QUERY_KEY, (current) => {
                if (!current) {
                    return current
                }

                return current.map((book) => (
                    book._id === id
                        ? {
                            ...book,
                            ...data,
                        }
                        : book
                ))
            })

            return { previousBooks }
        },
        onError: (_error, _variables, context) => {
            if (context?.previousBooks) {
                queryClient.setQueryData(BOOKS_QUERY_KEY, context.previousBooks)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
        },
    })

    const deleteBookMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/books/${id}`)
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: BOOKS_QUERY_KEY })
            const previousBooks = queryClient.getQueryData<Book[]>(BOOKS_QUERY_KEY)

            queryClient.setQueryData<Book[]>(BOOKS_QUERY_KEY, (current) => {
                if (!current) {
                    return current
                }
                return current.filter((book) => book._id !== id)
            })

            return { previousBooks }
        },
        onError: (_error, _id, context) => {
            if (context?.previousBooks) {
                queryClient.setQueryData(BOOKS_QUERY_KEY, context.previousBooks)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: BOOKS_QUERY_KEY })
        },
    })

    const deletingBookId = deleteBookMutation.isPending ? deleteBookMutation.variables : undefined
    const editingBookId = editBookMutation.isPending ? editBookMutation.variables?.id : undefined

    return {
        books,
        isLoading,
        error,
        addBook: addBookMutation.mutateAsync,
        editBook: editBookMutation.mutateAsync,
        deleteBook: deleteBookMutation.mutateAsync,
        isAddingBook: addBookMutation.isPending,
        isDeletingBook: deleteBookMutation.isPending,
        deletingBookId,
        isEditingBook: editBookMutation.isPending,
        editingBookId,
    }
}
