import type { components, paths } from "@/lib/generated/api-schema"

type Schemas = components["schemas"]

export type UserRole = Schemas["UserRole"]

export type ApiMessageResponse = Schemas["MessageResponse"]
export type ApiErrorResponse = Schemas["ErrorResponse"]
export type ValidationError = Schemas["ValidationError"]

export type Book = Schemas["Book"]
export type BookFormData = paths["/books"]["post"]["requestBody"]["content"]["application/json"]
export type PaginatedBooksResponse = Schemas["PaginatedBooks"]
export type BookUpdateResponse = Schemas["BookUpdateResponse"]
export type BookAvailabilityResponse = Schemas["BookAvailabilityResponse"]

export type AuthUser = Schemas["AuthenticatedUser"]
export type AuthResponse = Schemas["AuthSuccessResponse"]

export type ApiUser = Schemas["User"]
export type UserProfile = Schemas["UserProfile"]
export type UpdateUserRoleRequest = Schemas["UpdateUserRoleRequest"]
export type UpdateUserRoleResponse = Schemas["RoleUpdatedResponse"] | Schemas["MessageResponse"]

export type LoanUser = Schemas["LoanUserSummary"]
export type LoanRecord = Schemas["Loan"]
export type Loan = LoanRecord & {
  book?: Book | null
  user?: LoanUser | null
}
export type PaginatedLoansResponse = Schemas["PaginatedLoans"]
export type PaginatedUserLoansResponse = Schemas["PaginatedUserLoans"]
export type CreateLoanResponse = Schemas["Loan"]
export type LoanReturnResponse = Schemas["LoanReturnResponse"]
export type LoanExtendResponse = Schemas["LoanExtendResponse"]
export type OverdueRemindersResponse = Schemas["OverdueRemindersResponse"]

export type ReservationRecord = Schemas["Reservation"]
export type Reservation = ReservationRecord & {
  book?: Book | null
  user?: LoanUser | null
}
export type EnrichedReservation = Schemas["EnrichedReservation"]

export type DashboardKpis = Schemas["DashboardStaffKpis"] | Schemas["DashboardUserKpis"]
export type DashboardTrendRange = Exclude<
  NonNullable<paths["/dashboard/loan-trends"]["get"]["parameters"]["query"]>["range"],
  undefined
>
export type DashboardLoanTrends = Schemas["LoanTrendResponse"]

export type AuditLog = Schemas["AuditLog"]
