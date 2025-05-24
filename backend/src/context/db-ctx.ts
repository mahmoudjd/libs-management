import { Db, MongoClient } from "mongodb"

import type { BookDb } from "../types/types"
import type { LoanDb } from "../types/types"
import type { UserDb } from "../types/types"

export async function createDBContext(config: { connectionString: string, database: string }) {
  const client = new MongoClient(config.connectionString)
  try {
    const connect = await client.connect()
    const db = connect.db(config.database)
    console.log(`✓ Successfully connected to database [${config.database}]`,)
    const ctx = toDbCtx(db)
    return ctx

  } catch (error) {
    console.error("⚠ Could not connect to Library database with error ", error)
    process.exit(1)
  }
}

function toDbCtx(db: Db) {
  return {
    books: db.collection<BookDb>("books"),
    users: db.collection<UserDb>("users"),
    loans: db.collection<LoanDb>("loans")
  }
}

export type DBContext = ReturnType<typeof toDbCtx>
