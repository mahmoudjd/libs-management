import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { AuditLog, PaginatedAuditLogsResponse } from "@/lib/types"

export type AuditLogsQueryParams = {
  action?: string
  entityType?: string
  page: number
  pageSize: number
}

const AUDIT_LOGS_QUERY_ROOT = ["audit-logs"] as const

export const useAuditLogs = (params: AuditLogsQueryParams, enabled: boolean) => {
  const action = params.action?.trim() || undefined
  const entityType = params.entityType?.trim() || undefined

  const query = useQuery<PaginatedAuditLogsResponse>({
    queryKey: [...AUDIT_LOGS_QUERY_ROOT, { action, entityType, page: params.page, pageSize: params.pageSize }],
    enabled,
    // Keeps the previous page on screen while the next one loads instead of flashing empty.
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await apiClient.get<PaginatedAuditLogsResponse>("/audit-logs", {
        params: {
          ...(action ? { action } : {}),
          ...(entityType ? { entityType } : {}),
          page: String(params.page),
          pageSize: String(params.pageSize),
        },
      })
      return response.data
    },
  })

  const logs: AuditLog[] = query.data?.items ?? []
  const total = query.data?.total ?? 0
  const pageSize = query.data?.pageSize ?? params.pageSize
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return {
    logs,
    total,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  }
}
