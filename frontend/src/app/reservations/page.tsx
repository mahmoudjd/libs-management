"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { PageLayout } from "@/components/page-layout"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"
import { useReservations } from "@/lib/hooks/useReservations"
import type { Reservation } from "@/lib/types"

type StatusFilter = "all" | Reservation["status"]

const statusVariant: Record<Reservation["status"], "warning" | "success" | "secondary"> = {
  pending: "warning",
  fulfilled: "success",
  cancelled: "secondary",
}

export default function ReservationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = session?.user?.salesRole
  const isStaff = role === "admin" || role === "librarian"

  const {
    allReservations,
    isLoadingAllReservations,
    cancelReservation,
    isCancellingReservation,
  } = useReservations()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") {
      return
    }
    if (!session || !isStaff) {
      router.push("/")
    }
  }, [session, status, isStaff, router])

  const counts = useMemo(() => {
    return {
      all: allReservations.length,
      pending: allReservations.filter((item) => item.status === "pending").length,
      fulfilled: allReservations.filter((item) => item.status === "fulfilled").length,
      cancelled: allReservations.filter((item) => item.status === "cancelled").length,
    }
  }, [allReservations])

  const visibleReservations = useMemo(() => {
    if (statusFilter === "all") {
      return allReservations
    }
    return allReservations.filter((reservation) => reservation.status === statusFilter)
  }, [allReservations, statusFilter])

  const handleCancel = async (reservationId: string) => {
    try {
      setActionError(null)
      setCancellingId(reservationId)
      await cancelReservation(reservationId)
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to cancel reservation"))
    } finally {
      setCancellingId(null)
    }
  }

  if (!isStaff) {
    return null
  }

  const filterOptions: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: "pending", label: "Pending", count: counts.pending },
    { value: "fulfilled", label: "Fulfilled", count: counts.fulfilled },
    { value: "cancelled", label: "Cancelled", count: counts.cancelled },
    { value: "all", label: "All", count: counts.all },
  ]

  return (
    <PageLayout
      title="Reservations"
      description="The waiting queue for books that are currently out. Oldest pending request is served first."
    >
      <div className="mb-6">
        <SegmentedControl
          label="Filter reservations by status"
          options={filterOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {actionError && (
        <Alert variant="error" className="mb-6">
          {actionError}
        </Alert>
      )}

      {isLoadingAllReservations ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : visibleReservations.length === 0 ? (
        <EmptyState
          title="No reservations"
          description={
            statusFilter === "pending"
              ? "Nobody is currently waiting for a book."
              : "Nothing matches this filter."
          }
        />
      ) : (
        <ul className="space-y-3">
          {visibleReservations.map((reservation) => {
            const isCancelling = isCancellingReservation && cancellingId === reservation._id

            return (
              <li key={reservation._id}>
                <Card>
                  <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-foreground">
                          {reservation.book?.title ?? reservation.bookId}
                        </h2>
                        <Badge variant={statusVariant[reservation.status]}>
                          {reservation.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {reservation.user?.name ?? "Unknown user"}
                        {reservation.user?.email && ` · ${reservation.user.email}`}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Reserved {new Date(reservation.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {reservation.status === "pending" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="shrink-0"
                        onClick={() => handleCancel(reservation._id)}
                        disabled={isCancelling}
                      >
                        {isCancelling ? "Cancelling..." : "Cancel reservation"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </PageLayout>
  )
}
