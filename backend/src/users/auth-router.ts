import {Router} from "express";

import {loginUser} from "./login-user";
import {signupUser} from "./signup-user";
import {getUser} from "./get-user";

import {authentication} from "../middlewares/authentication";

import type {AppContext} from "../context/app-ctx";
import {getUsers} from "./get-users";
import {googleAuth} from "./google-auth";

export function authRoutes(appCtx: AppContext, appRouter: Router) {
    const authRouter = Router({mergeParams: true});

    authRouter.post("/login", loginUser(appCtx));
    authRouter.post("/google-login", googleAuth(appCtx))
    authRouter.post("/signup", signupUser(appCtx));

    authRouter.route("/users")
        .get(authentication(appCtx), getUsers(appCtx))
    authRouter.route("/get-user/:userId")
        .get(authentication(appCtx), getUser(appCtx))

    appRouter.use("/auth", authRouter);
}
