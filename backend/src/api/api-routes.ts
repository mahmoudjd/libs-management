import { Router } from "express";

import { AppContext } from "../context/app-ctx"
import { booksRoutes } from "../books/books-router";


export function apiRoutes(ctx: AppContext) {
  const router = Router()
  booksRoutes(ctx, router)
  return router;
}
