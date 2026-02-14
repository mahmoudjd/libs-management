import { Router } from "express"

import type { AppContext } from "../context/app-ctx"
import { authentication } from "../middlewares/authentication"
import { toRequestHandler } from "../lib/to-request-handler"
import { createReservationHandler } from "./create-reservation"
import { getMyReservationsHandler, getReservationsHandler } from "./get-reservations"
import { cancelReservationHandler } from "./cancel-reservation"

export function reservationRoutes(appCtx: AppContext, appRouter: Router) {
  const reservationRouter = Router({ mergeParams: true })

  reservationRouter.route("/")
    .get(toRequestHandler(authentication(appCtx)), toRequestHandler(getReservationsHandler(appCtx)))
    .post(toRequestHandler(authentication(appCtx)), toRequestHandler(createReservationHandler(appCtx)))

  reservationRouter.route("/me")
    .get(toRequestHandler(authentication(appCtx)), toRequestHandler(getMyReservationsHandler(appCtx)))

  reservationRouter.route("/:reservationId")
    .delete(toRequestHandler(authentication(appCtx)), toRequestHandler(cancelReservationHandler(appCtx)))

  appRouter.use("/reservations", reservationRouter)
}
