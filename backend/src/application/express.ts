import express from 'express'
import { AppContext } from '../context/app-ctx'
import cors from 'cors'
import compression from "compression"
import cookieParser from "cookie-parser"
import type { Request, Response } from "express"

import { apiRoutes } from "../api/api-routes"
import helmet from "helmet";


export function initExpress(app: express.Application, ctx: AppContext) {
  app.use(express.json({ limit: "1mb" }))
  app.use(express.urlencoded({ extended: false }))
  app.use(cors())
  app.use(cookieParser())
  app.use(compression())
  app.use(helmet())
  app.enable("trust proxy")
  app.disable("x-powered-by")

  app.get(`${ctx.config.api.prefix}/health`, (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" })
  })
  app.use(ctx.config.api.prefix, apiRoutes(ctx))
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Not Found" })
  })

  app.listen(ctx.config.app.port, () => {
    console.log(`✓ Listening on port ${ctx.config.app.port}`)
  }).on("error", (error) => {
    console.error(`⚠ Express: ${error}`)
    process.exit(1)
  })

}
