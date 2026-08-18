import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/apiClient"
import type {
  ApiUser,
  CreateUserRequest,
  UpdateUserRoleResponse,
  UserRole,
  UserStatusResponse,
} from "@/lib/types"

const USERS_QUERY_KEY = ["users"] as const

export const useUsers = (enabled: boolean) => {
  const queryClient = useQueryClient()

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
  }

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
    onSuccess: invalidateUsers,
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, disabled }: { userId: string; disabled: boolean }) => {
      const response = await apiClient.patch<UserStatusResponse>(
        `/auth/users/${userId}/status`,
        { disabled }
      )
      return response.data
    },
    onSuccess: invalidateUsers,
  })

  const createUserMutation = useMutation({
    mutationFn: async (newUser: CreateUserRequest) => {
      const response = await apiClient.post<ApiUser>("/auth/users", newUser)
      return response.data
    },
    onSuccess: invalidateUsers,
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/auth/users/${userId}`)
    },
    onSuccess: invalidateUsers,
  })

  return {
    users,
    isLoading,
    error,
    updateRole: updateRoleMutation.mutateAsync,
    updatingUserId: updateRoleMutation.isPending ? updateRoleMutation.variables?.userId : undefined,
    updateStatus: updateStatusMutation.mutateAsync,
    updatingStatusUserId: updateStatusMutation.isPending
      ? updateStatusMutation.variables?.userId
      : undefined,
    createUser: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,
    deleteUser: deleteUserMutation.mutateAsync,
    isDeletingUser: deleteUserMutation.isPending,
  }
}
