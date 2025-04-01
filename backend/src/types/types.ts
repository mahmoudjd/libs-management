import { z } from "zod"
import { ObjectId } from "mongodb"


/**
 * ObjectIdSchema is the schema for MongoDB ObjectIds
 */
export const ObjectIdSchema = z.object({
  _id: z.any(),
})

export const BookSchema = z.object({
  title: z.string(),
  author: z.string(),
  gener: z.string(),
  available: z.boolean().default(true),
})

const BookDbSchema = ObjectIdSchema.merge(BookSchema)

export const UserSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.enum(["admin", "user"]),
})

const UserDbSchema = ObjectIdSchema.merge(UserSchema)

export const LoanSchema = z.object({
  bookId: z.instanceof((ObjectId)),
  userId: z.instanceof(ObjectId),
  loanDate: z.date(),
  returnDate: z.date().nullable(),
})

const LoanDbSchema = ObjectIdSchema.merge(LoanSchema)

export type BookDb = z.infer<typeof BookDbSchema>

export type UserDb = z.infer<typeof UserDbSchema>

export type LoanDb = z.infer<typeof LoanDbSchema>

