import type { NextFunction, Request, RequestHandler, Response } from "express"

type HandlerLike = (
  req: Request,
  res: Response,
  next: NextFunction
) => unknown | Promise<unknown>

export function toRequestHandler(handler: HandlerLike): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}
