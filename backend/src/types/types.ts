import {z} from "zod"
import {ObjectId} from "mongodb"

/**
 * ObjectIdSchema is the schema for MongoDB ObjectIds
 */
export const ObjectIdSchema = z.instanceof(ObjectId);


export const DbBaseSchema = z.object({
    _id: ObjectIdSchema,
});

export const BookSchema = z.object({
    title: z.string(),
    author: z.string(),
    genre: z.string(),
    available: z.boolean().default(true),
})

const BookDbSchema = DbBaseSchema.merge(BookSchema)

export const UserSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    password: z.string(),
    role: z.enum(["admin", "user"]),
})

const UserDbSchema = DbBaseSchema.merge(UserSchema)

export const LoanSchema = z.object({
    bookId: z.instanceof((ObjectId)),
    userId: z.instanceof(ObjectId),
    loanDate: z.date(),
    returnDate: z.date().nullable(),
})

const LoanDbSchema = DbBaseSchema.merge(LoanSchema)

export type BookCreateOrUpdate = z.infer<typeof BookSchema>; // without _id

export type BookDb = z.infer<typeof BookDbSchema> // With _id

export type UserDb = z.infer<typeof UserDbSchema>

export type LoanDb = z.infer<typeof LoanDbSchema>

