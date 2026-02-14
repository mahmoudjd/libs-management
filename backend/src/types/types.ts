import { z } from "zod"
import { ObjectId } from "mongodb"

/**
 * ObjectIdSchema is the schema for MongoDB ObjectIds
 */
export const ObjectIdSchema = z.instanceof(ObjectId)

export const DbBaseSchema = z.object({
  _id: ObjectIdSchema,
})

export const UserRoleSchema = z.enum(["admin", "librarian", "user"])

export const BookSchema = z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1),
  genre: z.string().trim().min(1),
  totalCopies: z.coerce.number().int().positive().optional(),
  availableCopies: z.coerce.number().int().nonnegative().optional(),
  available: z.boolean().optional(),
}).superRefine((value, ctx) => {
  if (
    value.totalCopies !== undefined &&
    value.availableCopies !== undefined &&
    value.availableCopies > value.totalCopies
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["availableCopies"],
      message: "availableCopies must be lower than or equal to totalCopies",
    })
  }
})

const BookDbSchema = DbBaseSchema.merge(z.object({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1),
  genre: z.string().trim().min(1),
  totalCopies: z.number().int().positive().optional(),
  availableCopies: z.number().int().nonnegative().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}))

export const UserSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(1),
  role: UserRoleSchema,
})

const UserDbSchema = DbBaseSchema.merge(UserSchema)

export const LoanSchema = z.object({
  bookId: ObjectIdSchema,
  userId: ObjectIdSchema,
  loanDate: z.date(),
  returnDate: z.date(),
  returnedAt: z.date().nullable().default(null),
  extensionCount: z.number().int().min(0).max(2).default(0),
  source: z.enum(["direct", "reservation"]).default("direct"),
})

const LoanDbSchema = DbBaseSchema.merge(LoanSchema)

export const ReservationStatusSchema = z.enum(["pending", "fulfilled", "cancelled"])

export const ReservationSchema = z.object({
  bookId: ObjectIdSchema,
  userId: ObjectIdSchema,
  createdAt: z.date(),
  status: ReservationStatusSchema.default("pending"),
  fulfilledAt: z.date().nullable().default(null),
  cancelledAt: z.date().nullable().default(null),
})

const ReservationDbSchema = DbBaseSchema.merge(ReservationSchema)

export const AuditLogSchema = z.object({
  actorUserId: ObjectIdSchema.nullable(),
  actorRole: UserRoleSchema.optional(),
  action: z.string().trim().min(1),
  entityType: z.string().trim().min(1),
  entityId: z.string().trim().min(1).nullable(),
  details: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.date(),
})

const AuditLogDbSchema = DbBaseSchema.merge(AuditLogSchema)

export type BookCreateOrUpdate = z.infer<typeof BookSchema>

export type BookDb = z.infer<typeof BookDbSchema>

export type UserDb = z.infer<typeof UserDbSchema>

export type LoanDb = z.infer<typeof LoanDbSchema>

export type ReservationDb = z.infer<typeof ReservationDbSchema>

export type AuditLogDb = z.infer<typeof AuditLogDbSchema>

export type UserRole = z.infer<typeof UserRoleSchema>
