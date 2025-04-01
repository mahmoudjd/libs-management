import { Db, MongoClient } from "mongodb"


export async function createDBContext(config: { connectionString: string, database: string }) {
  const client = new MongoClient(config.connectionString)
  try {
    const connect = await client.connect()
    const db = connect.db(config.database)
    console.log(`✓ Successfully connected to database [${config.database}]`,)
    const ctx = toDbCtx(db)
    return ctx

  } catch (error) {
    console.error("⚠ Could not connect to Nestor database with error ", error)
    process.exit(1)
  }
}

function toDbCtx(db: Db) {
  return {
    books: db.collection("books"),
    users: db.collection("users"),
    loans: db.collection("loans")
  }

}

export type DBContext = ReturnType<typeof toDbCtx>
