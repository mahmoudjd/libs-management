import { Router } from 'express';

import type { AppContext } from '../context/app-ctx';

import { getBooksHandler } from './get-books';
import { createBookHandler } from './create-book';

const booksRouter = Router({ mergeParams: true });

/**
 * Books routes
 * @param appCtx
 * @param appRouter
 */
export function booksRoutes(appCtx: AppContext, appRouter: Router) {
  appRouter.use('/books', booksRouter);
  booksRoute(appCtx, booksRouter);
}

function booksRoute(appCtx: AppContext, router: Router) {
  router.route('/')
    .get(getBooksHandler(appCtx))
    .post(createBookHandler(appCtx))
}


