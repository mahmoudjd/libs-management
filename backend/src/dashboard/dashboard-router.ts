import { Router } from "express"

import type { AppContext } from "../context/app-ctx"
import { authentication } from "../middlewares/authentication"
import { toRequestHandler } from "../lib/to-request-handler"
import { getDashboardKpisHandler } from "./get-kpis"

export function dashboardRoutes(appCtx: AppContext, appRouter: Router) {
  const dashboardRouter = Router({ mergeParams: true })

  dashboardRouter.route("/kpis")
    .get(toRequestHandler(authentication(appCtx)), toRequestHandler(getDashboardKpisHandler(appCtx)))

  appRouter.use("/dashboard", dashboardRouter)
}
