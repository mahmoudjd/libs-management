import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { isStaff } from "../lib/authorization"
import { parseObjectId } from "../lib/object-id"
import type { AuthenticatedRequest } from "../types/http"
import { cancelReservation } from "./reservation-service"

export const cancelReservationHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const reservationId = req.params.reservationId
  const parsedReservationId = parseObjectId(reservationId)

  if (!parsedReservationId) {
    return res.status(400).json({ error: "Invalid reservation ID" })
  }

  try {
    const existingReservation = await appCtx.dbCtx.reservations.findOne({ _id: parsedReservationId })
    if (!existingReservation) {
      return res.status(404).json({ error: "Reservation not found" })
    }

    if (!isStaff(req.user) && existingReservation.userId.toHexString() !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" })
    }

    if (existingReservation.status !== "pending") {
      return res.status(409).json({ error: "Only pending reservations can be cancelled" })
    }

    const cancelled = await cancelReservation(appCtx, parsedReservationId, req.user)
    if (!cancelled) {
      return res.status(409).json({ error: "Reservation cancel failed" })
    }

    return res.status(200).json({ message: "Reservation cancelled successfully" })
  } catch (error) {
    console.error("Error cancelling reservation:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
