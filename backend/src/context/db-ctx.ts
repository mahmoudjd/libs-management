import { Db, MongoClient } from "mongodb"

import type { BookDb } from "../types/types"
import type { LoanDb } from "../types/types"
import type { UserDb } from "../types/types"

export async function createDBContext(config: { connectionString: string, database: string }) {
  const client = new MongoClient(config.connectionString)
  try {
    await client.connect()
    const db = client.db(config.database)
    await ensureIndexes(db)
    console.log(`✓ Successfully connected to database [${config.database}]`,)
    return toDbCtx(db)

  } catch (error) {
    console.error("⚠ Could not connect to Library database with error ", error)
    process.exit(1)
  }
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection<UserDb>("users").createIndex({ email: 1 }, { name: "users_email_idx" }),
    db.collection<LoanDb>("loans").createIndex({ userId: 1 }, { name: "loans_user_id_idx" }),
    db.collection<LoanDb>("loans").createIndex({ bookId: 1 }, { name: "loans_book_id_idx" }),
    db.collection<BookDb>("books").createIndex({ available: 1 }, { name: "books_available_idx" }),
  ])
}

function toDbCtx(db: Db) {
  const books = db.collection<BookDb>("books")
  const users = db.collection<UserDb>("users")
  const loans = db.collection<LoanDb>("loans")

  return {
    books,
    users,
    loans
  }
}

export type DBContext = ReturnType<typeof toDbCtx>
