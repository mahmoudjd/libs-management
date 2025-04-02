import { Router } from "express";
import { loginUser } from "./login-user";
import { signupUser } from "./signup-user";
import type { AppContext } from "../context/app-ctx";

export function authRoutes(appCtx: AppContext, appRouter: Router) {
  const authRouter = Router();

  authRouter.post("/login", loginUser(appCtx));
  authRouter.post("/signup", signupUser(appCtx));

  appRouter.use("/auth", authRouter);
}
