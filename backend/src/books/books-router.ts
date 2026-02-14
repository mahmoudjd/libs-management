import { Router } from 'express';

import type { AppContext } from '../context/app-ctx';

import { getBooksHandler } from './get-books';
import { createBookHandler } from './create-book';
import { deleteBookHandler } from './delete-book';
import { authentication } from '../middlewares/authentication';
import { updateBookHandler } from './update-book';
import {changeBookAvailability} from "./change-book-availability";
import { toRequestHandler } from "../lib/to-request-handler";

/**
 * Books routes
 * @param appCtx
 * @param appRouter
 */
export function booksRoutes(appCtx: AppContext, appRouter: Router) {
  const booksRouter = Router({ mergeParams: true });
  booksRouter.route('/')
    .get(toRequestHandler(getBooksHandler(appCtx)))
    .post(toRequestHandler(authentication(appCtx)), toRequestHandler(createBookHandler(appCtx)))

  booksRouter.route('/:bookId')
    .delete(toRequestHandler(authentication(appCtx)), toRequestHandler(deleteBookHandler(appCtx)))
    .put(toRequestHandler(authentication(appCtx)), toRequestHandler(updateBookHandler(appCtx)))
  booksRouter.route('/:bookId/change-availability')
      .put(toRequestHandler(authentication(appCtx)), toRequestHandler(changeBookAvailability(appCtx)))

  appRouter.use('/books', booksRouter);
}
