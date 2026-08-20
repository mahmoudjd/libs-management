import {Router} from "express";

import {loginUser} from "./login-user";
import {signupUser} from "./signup-user";

import {authentication} from "../middlewares/authentication";

import type {AppContext} from "../context/app-ctx";
import {getUsers} from "./get-users";
import {googleAuth} from "./google-auth";
import { toRequestHandler } from "../lib/to-request-handler";
import { updateUserRoleHandler } from "./update-user-role";
import { updateUserStatusHandler } from "./update-user-status";
import { deleteUserHandler } from "./delete-user";
import { createUserHandler } from "./create-user";
import { getMeHandler } from "./get-me";
import { updateProfileHandler } from "./update-profile";

export function authRoutes(appCtx: AppContext, appRouter: Router) {
    const authRouter = Router({mergeParams: true});

    authRouter.post("/login", toRequestHandler(loginUser(appCtx)));
    authRouter.post("/google-login", toRequestHandler(googleAuth(appCtx)))
    authRouter.post("/signup", toRequestHandler(signupUser(appCtx)));

    authRouter.route("/me")
        .get(toRequestHandler(authentication(appCtx)), toRequestHandler(getMeHandler(appCtx)))
        .patch(toRequestHandler(authentication(appCtx)), toRequestHandler(updateProfileHandler(appCtx)))

    authRouter.route("/users")
        .get(toRequestHandler(authentication(appCtx)), toRequestHandler(getUsers(appCtx)))
        .post(toRequestHandler(authentication(appCtx)), toRequestHandler(createUserHandler(appCtx)))
    authRouter.route("/users/:userId")
        .delete(toRequestHandler(authentication(appCtx)), toRequestHandler(deleteUserHandler(appCtx)))
    authRouter.route("/users/:userId/role")
      .patch(toRequestHandler(authentication(appCtx)), toRequestHandler(updateUserRoleHandler(appCtx)))
    authRouter.route("/users/:userId/status")
      .patch(toRequestHandler(authentication(appCtx)), toRequestHandler(updateUserStatusHandler(appCtx)))

    appRouter.use("/auth", authRouter);
}
