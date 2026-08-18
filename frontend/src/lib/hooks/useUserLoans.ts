import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { Loan } from "@/lib/types"

/** Loans of an arbitrary user. The backend restricts this to admins and the user themselves. */
export const useUserLoans = (userId: string | undefined) => {
  const { data: loans = [], isLoading, error } = useQuery<Loan[]>({
    queryKey: ["loans", "user", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const response = await apiClient.get<Loan[]>(`/loans/${userId}`)
      return response.data
    },
    staleTime: 30_000,
  })

  return { loans, isLoading, error }
}
