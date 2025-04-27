import { Router } from "express";
import { authentication } from "../middlewares/authentication";
import { createLoanHandler } from "./create-loan";
import { updateLoanHandler } from "./update-loan";
import { deleteLoandHandler } from "./delete-loan";
import { getLoansHandler } from "./get-loans";
import { getLoansByUserIdHandler } from "./get-user-loans"

import type { AppContext } from "../context/app-ctx";

const loanRouter = Router({ mergeParams: true });

export function loanRoutes(appCtx: AppContext, appRouter: Router) {
  loanRouter.route("/")
    .get(authentication(appCtx), getLoansHandler(appCtx))
    .post(authentication(appCtx), createLoanHandler(appCtx));

  loanRouter.route("/:userId")
    .get(authentication(appCtx), getLoansByUserIdHandler(appCtx))

  loanRouter.route("/:loanId")
    .put(authentication(appCtx), updateLoanHandler(appCtx))
    .delete(authentication(appCtx), deleteLoandHandler(appCtx));


  appRouter.use("/loans", loanRouter);
}

