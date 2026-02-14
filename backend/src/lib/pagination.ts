export interface Pagination {
  page: number
  pageSize: number
  skip: number
}

function parsePositiveInt(value: unknown, fallback: number, max: number) {
  const parsed = Number.parseInt(String(value), 10)
  if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed < 1) {
    return fallback
  }
  return Math.min(parsed, max)
}

export function parsePagination(
  query: Record<string, unknown>,
  options: { defaultPage?: number; defaultPageSize?: number; maxPageSize?: number } = {}
): Pagination {
  const defaultPage = options.defaultPage ?? 1
  const defaultPageSize = options.defaultPageSize ?? 20
  const maxPageSize = options.maxPageSize ?? 100

  const page = parsePositiveInt(query.page, defaultPage, Number.MAX_SAFE_INTEGER)
  const pageSize = parsePositiveInt(query.pageSize, defaultPageSize, maxPageSize)

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  }
}

export function hasPaginationQuery(query: Record<string, unknown>) {
  return query.page !== undefined || query.pageSize !== undefined || query.paginated === "true"
}
