import { Router } from "express";

import { AppContext } from "../context/app-ctx"
import { booksRoutes } from "../books/books-router";
import { authRoutes } from "../users/auth-router";
import { loanRoutes } from "../loans/loan-router";


export function apiRoutes(ctx: AppContext) {
  const router = Router()
  authRoutes(ctx, router)
  booksRoutes(ctx, router)
  loanRoutes(ctx, router)

  return router;
}
