import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type { ApiUser, UpdateUserRoleResponse, UserRole } from "@/lib/types"

const USERS_QUERY_KEY = ["users"] as const

export const useUsers = (enabled: boolean) => {
  const queryClient = useQueryClient()

  const { data: users = [], isLoading, error } = useQuery<ApiUser[]>({
    queryKey: USERS_QUERY_KEY,
    enabled,
    queryFn: async () => {
      const response = await apiClient.get<ApiUser[]>("/auth/users")
      return response.data
    },
    staleTime: 30_000,
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const response = await apiClient.patch<UpdateUserRoleResponse>(
        `/auth/users/${userId}/role`,
        { role }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
  })

  return {
    users,
    isLoading,
    error,
    updateRole: updateRoleMutation.mutateAsync,
    updatingUserId: updateRoleMutation.isPending ? updateRoleMutation.variables?.userId : undefined,
  }
}
