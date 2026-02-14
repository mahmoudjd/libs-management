import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

import { apiClient } from "@/lib/apiClient"
import type { Reservation } from "@/lib/types"

const MY_RESERVATIONS_QUERY_KEY = ["reservations", "me"] as const
const ALL_RESERVATIONS_QUERY_KEY = ["reservations", "all"] as const

export const useReservations = () => {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const role = session?.user?.salesRole
  const isStaff = role === "admin" || role === "librarian"

  const { data: myReservations = [] } = useQuery<Reservation[]>({
    queryKey: MY_RESERVATIONS_QUERY_KEY,
    enabled: Boolean(session?.user?.id),
    queryFn: async () => {
      const response = await apiClient.get<Reservation[]>("/reservations/me")
      return response.data
    },
    staleTime: 30_000,
  })

  const { data: allReservations = [] } = useQuery<Reservation[]>({
    queryKey: ALL_RESERVATIONS_QUERY_KEY,
    enabled: isStaff,
    queryFn: async () => {
      const response = await apiClient.get<Reservation[]>("/reservations")
      return response.data
    },
    staleTime: 30_000,
  })

  const reserveMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const response = await apiClient.post<Reservation>("/reservations", { bookId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_RESERVATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ALL_RESERVATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["books"] })
    },
  })

  const cancelReservationMutation = useMutation({
    mutationFn: async (reservationId: string) => {
      await apiClient.delete(`/reservations/${reservationId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_RESERVATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ALL_RESERVATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["books"] })
    },
  })

  const pendingReservationByBookId = useMemo(() => {
    const map = new Map<string, Reservation>()
    for (const reservation of myReservations) {
      if (reservation.status === "pending") {
        map.set(reservation.bookId, reservation)
      }
    }
    return map
  }, [myReservations])

  return {
    myReservations,
    allReservations,
    reserveBook: reserveMutation.mutateAsync,
    cancelReservation: cancelReservationMutation.mutateAsync,
    isReserving: reserveMutation.isPending,
    reservingBookId: reserveMutation.isPending ? reserveMutation.variables : undefined,
    isCancellingReservation: cancelReservationMutation.isPending,
    pendingReservationByBookId,
  }
}
