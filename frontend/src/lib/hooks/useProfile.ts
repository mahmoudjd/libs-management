import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { apiClient } from "@/lib/apiClient"
import type { UpdateProfileRequest, UserProfile } from "@/lib/types"

const PROFILE_QUERY_KEY = ["profile", "me"] as const

export const useProfile = () => {
  const queryClient = useQueryClient()
  const { data: session, update: updateSession } = useSession()

  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: PROFILE_QUERY_KEY,
    enabled: Boolean(session?.user?.id),
    queryFn: async () => {
      const response = await apiClient.get<UserProfile>("/auth/me")
      return response.data
    },
    staleTime: 60_000,
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (changes: UpdateProfileRequest) => {
      const response = await apiClient.patch<UserProfile>("/auth/me", changes)
      return response.data
    },
    onSuccess: async (updatedProfile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, updatedProfile)
      // Keeps the header greeting and the JWT in step with the new values.
      await updateSession({
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
      })
    },
  })

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
  }
}
