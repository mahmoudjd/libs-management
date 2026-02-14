import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { apiClient } from "@/lib/apiClient"
import type { DashboardKpis } from "@/lib/types"

const DASHBOARD_KPIS_QUERY_KEY = ["dashboard", "kpis"] as const

export const useDashboardKpis = () => {
  const { data: session } = useSession()

  return useQuery<DashboardKpis>({
    queryKey: DASHBOARD_KPIS_QUERY_KEY,
    enabled: Boolean(session?.user?.id),
    queryFn: async () => {
      const response = await apiClient.get<DashboardKpis>("/dashboard/kpis")
      return response.data
    },
    staleTime: 30_000,
  })
}
