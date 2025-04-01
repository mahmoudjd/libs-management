import express from 'express'
import { AppContext } from '../context/app-ctx'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { apiRoutes } from "../api/api-routes"


export function initExpress(app: express.Application, ctx: AppContext) {

  app.use(express.json())
  app.use(cors())
  app.use(cookieParser())

  app.use(ctx.config.api.prefix, (req, res, next) => {
    console.log(" API prefix ", ctx.config.api.prefix)
    console.log(" API path ", req.path)
  })

  app.use(ctx.config.api.prefix, apiRoutes(ctx))

  app.listen(ctx.config.app.port, () => {
    console.log("✓ Backend API starting")
    console.log(`✓ Environment [${process.env.NODE_ENV}]`)
    console.log(`✓ Listening on port ${ctx.config.app.port}`)
  }).on("error", (error) => {
    console.error(`⚠ Express: ${error}`)
    process.exit(1)
  })

}
