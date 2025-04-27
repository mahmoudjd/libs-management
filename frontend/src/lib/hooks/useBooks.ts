import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Book, BookFormData } from "@/lib/types";

export const useBooks = () => {
    const queryClient = useQueryClient();

    const { data: books = [], isLoading, error } = useQuery<Book[]>({
        queryKey: ["books"],
        queryFn: async () => {
            const response = await apiClient.get("/books");
            return response.data;
        },
    });

    const addBookMutation = useMutation({
        mutationFn: async (newBook: BookFormData) => {
            const response = await apiClient.post("/books", newBook);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["books"] });
        },
    });

    const editBookMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: BookFormData }) => {
            const response = await apiClient.put(`/books/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["books"] });
        },
    });

    const deleteBookMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/books/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["books"] });
        },
    });

    return {
        books,
        isLoading,
        error,
        addBook: addBookMutation.mutateAsync,
        editBook: editBookMutation.mutateAsync,
        deleteBook: deleteBookMutation.mutateAsync,
    };
};
