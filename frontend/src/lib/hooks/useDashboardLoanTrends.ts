import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { apiClient } from "@/lib/apiClient"
import type { DashboardLoanTrends, DashboardTrendRange } from "@/lib/types"

const DASHBOARD_LOAN_TRENDS_QUERY_KEY = ["dashboard", "loan-trends"] as const

export const useDashboardLoanTrends = (range: DashboardTrendRange) => {
  const { data: session } = useSession()

  return useQuery<DashboardLoanTrends>({
    queryKey: [...DASHBOARD_LOAN_TRENDS_QUERY_KEY, range],
    enabled: Boolean(session?.user?.id),
    queryFn: async () => {
      const response = await apiClient.get<DashboardLoanTrends>("/dashboard/loan-trends", {
        params: { range },
      })
      return response.data
    },
    staleTime: 30_000,
  })
}
