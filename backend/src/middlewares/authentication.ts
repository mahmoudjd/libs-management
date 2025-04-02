import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { extractAccessTokenFromRequest } from "../api/lib/extract-access-token-from-request";
import type { AppContext } from "../context/app-ctx";
import { ObjectId } from "mongodb";

export const authentication =
  (ctx: AppContext) =>
    async (req: any, res: Response, next: NextFunction) => {
      const { originalUrl, method } = req;

      console.info(`🔒 Authenticating request: ${method} ${originalUrl}`);

      const accessToken = extractAccessTokenFromRequest(req);
      if (!accessToken) {
        return res.status(401).json({ error: "Missing token in Authorization header" });
      }

      try {
        // Verify JWT token
        const decoded = jwt.verify(accessToken, ctx.config.auth.secret) as {
          userId: string;
          firstName: string;
          lastName: string;
          email: string;
          role: string;
        };

        // Benutzer in der Datenbank suchen
        const user = await ctx.dbCtx.users.findOne({ _id: new ObjectId(decoded.userId) });

        if (!user) {
          return res.status(401).json({ error: "Invalid token: user not found" });
        }

        // Add user infos to Request
        req.user = {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        };

        console.info(`✅ User authenticated: ${user.email} (${user.role})`);
        next();
      } catch (error) {
        console.error("❌ Authentication error:", error);
        return res.status(401).json({ error: "Invalid token" });
      }
    };
