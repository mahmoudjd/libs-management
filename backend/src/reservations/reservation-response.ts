import type { ReservationDb } from "../types/types"

export function toReservationResponse(reservation: ReservationDb) {
  return {
    _id: reservation._id.toHexString(),
    bookId: reservation.bookId.toHexString(),
    userId: reservation.userId.toHexString(),
    createdAt: reservation.createdAt,
    status: reservation.status,
    fulfilledAt: reservation.fulfilledAt,
    cancelledAt: reservation.cancelledAt,
  }
}
