import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { GenreCount } from "@/lib/types"

/** Genres actually present in the catalogue, so the filter offers real options. */
export const useGenres = () => {
  const { data: genres = [], isLoading } = useQuery<GenreCount[]>({
    queryKey: ["books", "genres"],
    queryFn: async () => {
      const response = await apiClient.get<GenreCount[]>("/books/genres")
      return response.data
    },
    staleTime: 5 * 60_000,
  })

  return { genres, isLoading }
}
