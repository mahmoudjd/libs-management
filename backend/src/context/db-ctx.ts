import { Db, MongoClient } from "mongodb"

import type { AuditLogDb, BookDb, LoanDb, ReservationDb, UserDb } from "../types/types"

export async function createDBContext(config: { connectionString: string, database: string }) {
  const client = new MongoClient(config.connectionString)
  try {
    await client.connect()
    const db = client.db(config.database)
    await runDataMigrations(db)
    await ensureIndexes(db)
    console.log(`✓ Successfully connected to database [${config.database}]`)
    return toDbCtx(db)

  } catch (error) {
    console.error("⚠ Could not connect to Library database with error ", error)
    process.exit(1)
  }
}

async function runDataMigrations(db: Db) {
  const now = new Date()

  await db.collection<BookDb>("books").updateMany(
    { totalCopies: { $exists: false } },
    [
      {
        $set: {
          totalCopies: 1,
          availableCopies: {
            $cond: [
              { $eq: ["$available", false] },
              0,
              1,
            ],
          },
          createdAt: { $ifNull: ["$createdAt", now] },
          updatedAt: now,
        },
      },
    ]
  )

  await db.collection<BookDb>("books").updateMany(
    { availableCopies: { $exists: false } },
    [
      {
        $set: {
          availableCopies: {
            $ifNull: ["$totalCopies", 1],
          },
          updatedAt: now,
        },
      },
    ]
  )

  await db.collection<LoanDb>("loans").updateMany(
    { returnedAt: { $exists: false } },
    { $set: { returnedAt: null } }
  )
  await db.collection<LoanDb>("loans").updateMany(
    { extensionCount: { $exists: false } },
    { $set: { extensionCount: 0 } }
  )
  await db.collection<LoanDb>("loans").updateMany(
    { source: { $exists: false } },
    { $set: { source: "direct" } }
  )
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection<UserDb>("users").createIndex({ email: 1 }, { name: "users_email_idx" }),

    db.collection<BookDb>("books").createIndex({ availableCopies: 1 }, { name: "books_available_copies_idx" }),
    db.collection<BookDb>("books").createIndex({ genre: 1 }, { name: "books_genre_idx" }),
    db.collection<BookDb>("books").createIndex(
      { title: "text", author: "text", genre: "text" },
      { name: "books_text_search_idx" }
    ),

    db.collection<LoanDb>("loans").createIndex({ userId: 1 }, { name: "loans_user_id_idx" }),
    db.collection<LoanDb>("loans").createIndex({ bookId: 1 }, { name: "loans_book_id_idx" }),
    db.collection<LoanDb>("loans").createIndex({ returnedAt: 1, returnDate: 1 }, { name: "loans_status_due_idx" }),

    db.collection<ReservationDb>("reservations").createIndex(
      { bookId: 1, status: 1, createdAt: 1 },
      { name: "reservations_book_status_created_idx" }
    ),
    db.collection<ReservationDb>("reservations").createIndex(
      { userId: 1, status: 1 },
      { name: "reservations_user_status_idx" }
    ),

    db.collection<AuditLogDb>("audit_logs").createIndex({ createdAt: -1 }, { name: "audit_logs_created_idx" }),
    db.collection<AuditLogDb>("audit_logs").createIndex({ actorUserId: 1 }, { name: "audit_logs_actor_idx" }),
  ])
}

function toDbCtx(db: Db) {
  const books = db.collection<BookDb>("books")
  const users = db.collection<UserDb>("users")
  const loans = db.collection<LoanDb>("loans")
  const reservations = db.collection<ReservationDb>("reservations")
  const auditLogs = db.collection<AuditLogDb>("audit_logs")

  return {
    books,
    users,
    loans,
    reservations,
    auditLogs,
  }
}

export type DBContext = ReturnType<typeof toDbCtx>
