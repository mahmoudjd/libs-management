import type { LoanDb } from "../types/types"

export function normalizeLoan(loan: LoanDb) {
  return {
    ...loan,
    returnedAt: loan.returnedAt ?? null,
    extensionCount: loan.extensionCount ?? 0,
    source: loan.source ?? "direct",
  }
}

export function isLoanReturned(loan: LoanDb) {
  return normalizeLoan(loan).returnedAt !== null
}

export function isLoanOverdue(loan: LoanDb, now = new Date()) {
  const normalized = normalizeLoan(loan)
  if (normalized.returnedAt) {
    return false
  }
  return normalized.returnDate.getTime() < now.getTime()
}

export function getActiveLoanStatus(loan: LoanDb, now = new Date()) {
  if (isLoanReturned(loan)) {
    return "returned" as const
  }
  if (isLoanOverdue(loan, now)) {
    return "overdue" as const
  }
  return "active" as const
}

export function toLoanResponse(loan: LoanDb, now = new Date()) {
  const normalized = normalizeLoan(loan)
  const status = getActiveLoanStatus(normalized, now)

  return {
    _id: normalized._id.toHexString(),
    bookId: normalized.bookId.toHexString(),
    userId: normalized.userId.toHexString(),
    loanDate: normalized.loanDate,
    returnDate: normalized.returnDate,
    returnedAt: normalized.returnedAt,
    extensionCount: normalized.extensionCount,
    source: normalized.source,
    status,
    overdue: status === "overdue",
  }
}
