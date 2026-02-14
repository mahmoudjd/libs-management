import {Router} from "express";

import {loginUser} from "./login-user";
import {signupUser} from "./signup-user";
import {getUser} from "./get-user";

import {authentication} from "../middlewares/authentication";

import type {AppContext} from "../context/app-ctx";
import {getUsers} from "./get-users";
import {googleAuth} from "./google-auth";
import { toRequestHandler } from "../lib/to-request-handler";
import { updateUserRoleHandler } from "./update-user-role";

export function authRoutes(appCtx: AppContext, appRouter: Router) {
    const authRouter = Router({mergeParams: true});

    authRouter.post("/login", toRequestHandler(loginUser(appCtx)));
    authRouter.post("/google-login", toRequestHandler(googleAuth(appCtx)))
    authRouter.post("/signup", toRequestHandler(signupUser(appCtx)));

    authRouter.route("/users")
        .get(toRequestHandler(authentication(appCtx)), toRequestHandler(getUsers(appCtx)))
    authRouter.route("/get-user/:userId")
        .get(toRequestHandler(authentication(appCtx)), toRequestHandler(getUser(appCtx)))
    authRouter.route("/users/:userId/role")
      .patch(toRequestHandler(authentication(appCtx)), toRequestHandler(updateUserRoleHandler(appCtx)))

    appRouter.use("/auth", authRouter);
}
