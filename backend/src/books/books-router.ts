import { Router } from 'express';

import type { AppContext } from '../context/app-ctx';

import { getBooksHandler } from './get-books';
import { createBookHandler } from './create-book';
import { deleteBookHandler } from './delete-book';
import { authentication } from '../middlewares/authentication';
import { updateBookHandler } from './update-book';
import {changeBookAvailability} from "./change-book-availability";


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
    .post(authentication(appCtx), createBookHandler(appCtx))

  router.route('/:bookId')
    .delete(authentication(appCtx), deleteBookHandler(appCtx))
    .put(authentication(appCtx), updateBookHandler(appCtx))
  router.route('/:bookId/change-availability')
      .put(authentication(appCtx), changeBookAvailability(appCtx))
}


