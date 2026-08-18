import type { NextFunction, Request, RequestHandler, Response } from "express"

type HandlerLike<TRequest> = (
  req: TRequest,
  res: Response,
  next: NextFunction
) => unknown | Promise<unknown>

/**
 * Wraps an async handler so a rejected promise reaches the express error
 * handler instead of dangling.
 *
 * Generic over the request type: handlers type their own `req` (most use
 * AuthenticatedRequest, which pins params to plain strings), and express hands
 * us the wider Request<ParamsDictionary>. The two only differ in the params
 * value type, so the cast is absorbed here rather than at every call site.
 */
export function toRequestHandler<TRequest extends Request<any>>(
  handler: HandlerLike<TRequest>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req as unknown as TRequest, res, next)).catch(next)
  }
}
