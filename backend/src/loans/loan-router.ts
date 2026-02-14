import { Router } from "express";
import { authentication } from "../middlewares/authentication";
import { createLoanHandler } from "./create-loan";
import { updateLoanHandler } from "./update-loan";
import { deleteLoandHandler } from "./delete-loan";
import { getLoansHandler } from "./get-loans";
import { getLoansByUserIdHandler } from "./get-user-loans"

import type { AppContext } from "../context/app-ctx";
import { toRequestHandler } from "../lib/to-request-handler";

export function loanRoutes(appCtx: AppContext, appRouter: Router) {
  const loanRouter = Router({ mergeParams: true });

  loanRouter.route("/")
    .get(toRequestHandler(authentication(appCtx)), toRequestHandler(getLoansHandler(appCtx)))
    .post(toRequestHandler(authentication(appCtx)), toRequestHandler(createLoanHandler(appCtx)));

  loanRouter.route("/:userId")
    .get(toRequestHandler(authentication(appCtx)), toRequestHandler(getLoansByUserIdHandler(appCtx)))

  loanRouter.route("/:loanId")
    .put(toRequestHandler(authentication(appCtx)), toRequestHandler(updateLoanHandler(appCtx)))
    .delete(toRequestHandler(authentication(appCtx)), toRequestHandler(deleteLoandHandler(appCtx)));


  appRouter.use("/loans", loanRouter);
}
