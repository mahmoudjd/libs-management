import express from "express"

import { loadConfig } from "./config/config"
import { createAppContext } from "./context/app-ctx"
import { initExpress } from "./application/express"

async function startServer() {
  const config = loadConfig()

  console.log("✓ Backend API starting")
  console.log(`✓ Environment [${process.env.NODE_ENV}]`)

  const ctx = await createAppContext(config)
  const app = express()

  initExpress(app, ctx)
}

startServer()
