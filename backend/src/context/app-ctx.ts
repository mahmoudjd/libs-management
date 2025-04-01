import { Config } from "../config/config"
import { DBContext, createDBContext } from "./db-ctx"

export async function createAppContext(config: Config) {

  const dbCtx = await createDBContext(config.db)

  const appCtx = toAppCtx(config, dbCtx)

  return appCtx
}

function toAppCtx(config: Config, dbCtx: DBContext) {
  return {
    config,
    dbCtx
  }
}

export type AppContext = ReturnType<typeof toAppCtx>

