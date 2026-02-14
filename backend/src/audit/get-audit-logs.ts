import { Response } from "express"

import { AppContext } from "../context/app-ctx"
import { isAdmin } from "../lib/authorization"
import { hasPaginationQuery, parsePagination } from "../lib/pagination"
import type { AuthenticatedRequest } from "../types/http"

function getAuditFilter(query: AuthenticatedRequest["query"]) {
  const filter: Record<string, unknown> = {}

  if (typeof query.action === "string" && query.action.trim() !== "") {
    filter.action = query.action.trim()
  }

  if (typeof query.entityType === "string" && query.entityType.trim() !== "") {
    filter.entityType = query.entityType.trim()
  }

  return filter
}

function toAuditLogResponse(row: {
  _id: { toHexString: () => string }
  actorUserId: { toHexString: () => string } | null
  actorRole?: string
  action: string
  entityType: string
  entityId: string | null
  details: Record<string, unknown>
  createdAt: Date
}) {
  return {
    _id: row._id.toHexString(),
    actorUserId: row.actorUserId?.toHexString() ?? null,
    actorRole: row.actorRole,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    details: row.details,
    createdAt: row.createdAt,
  }
}

export const getAuditLogsHandler = (appCtx: AppContext) => async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({ error: "Only admins can read audit logs" })
  }

  const filter = getAuditFilter(req.query)

  try {
    if (hasPaginationQuery(req.query as Record<string, unknown>)) {
      const { page, pageSize, skip } = parsePagination(req.query as Record<string, unknown>, {
        defaultPage: 1,
        defaultPageSize: 50,
        maxPageSize: 200,
      })

      const [rows, total] = await Promise.all([
        appCtx.dbCtx.auditLogs.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).toArray(),
        appCtx.dbCtx.auditLogs.countDocuments(filter),
      ])

      return res.status(200).json({
        items: rows.map((row) => toAuditLogResponse(row)),
        total,
        page,
        pageSize,
      })
    }

    const rows = await appCtx.dbCtx.auditLogs.find(filter).sort({ createdAt: -1 }).toArray()
    return res.status(200).json(rows.map((row) => toAuditLogResponse(row)))
  } catch (error) {
    console.error("Error getting audit logs:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
