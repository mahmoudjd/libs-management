import { Router } from "express"

import type { AppContext } from "../context/app-ctx"
import { authentication } from "../middlewares/authentication"
import { toRequestHandler } from "../lib/to-request-handler"
import { exportBooksCsvHandler, exportLoansCsvHandler, exportUsersCsvHandler } from "./export-csv"

export function exportRoutes(appCtx: AppContext, appRouter: Router) {
  const exportRouter = Router({ mergeParams: true })

  exportRouter.route("/books.csv")
    .get(toRequestHandler(authentication(appCtx)), toRequestHandler(exportBooksCsvHandler(appCtx)))

  exportRouter.route("/users.csv")
    .get(toRequestHandler(authentication(appCtx)), toRequestHandler(exportUsersCsvHandler(appCtx)))

  exportRouter.route("/loans.csv")
    .get(toRequestHandler(authentication(appCtx)), toRequestHandler(exportLoansCsvHandler(appCtx)))

  appRouter.use("/exports", exportRouter)
}
