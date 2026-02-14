import { Router } from "express";

import { AppContext } from "../context/app-ctx"
import { booksRoutes } from "../books/books-router";
import { authRoutes } from "../users/auth-router";
import { loanRoutes } from "../loans/loan-router";
import { reservationRoutes } from "../reservations/reservations-router";
import { dashboardRoutes } from "../dashboard/dashboard-router";
import { exportRoutes } from "../exports/export-router";
import { auditRoutes } from "../audit/audit-router";


export function apiRoutes(ctx: AppContext) {
  const router = Router()
  authRoutes(ctx, router)
  booksRoutes(ctx, router)
  loanRoutes(ctx, router)
  reservationRoutes(ctx, router)
  dashboardRoutes(ctx, router)
  exportRoutes(ctx, router)
  auditRoutes(ctx, router)

  return router;
}
