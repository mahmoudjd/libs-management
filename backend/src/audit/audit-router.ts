import { Router } from "express"

import type { AppContext } from "../context/app-ctx"
import { authentication } from "../middlewares/authentication"
import { toRequestHandler } from "../lib/to-request-handler"
import { getAuditLogsHandler } from "./get-audit-logs"

export function auditRoutes(appCtx: AppContext, appRouter: Router) {
  const auditRouter = Router({ mergeParams: true })

  auditRouter.route("/")
    .get(toRequestHandler(authentication(appCtx)), toRequestHandler(getAuditLogsHandler(appCtx)))

  appRouter.use("/audit-logs", auditRouter)
}
