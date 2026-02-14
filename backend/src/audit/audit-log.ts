import { ObjectId } from "mongodb"

import type { AppContext } from "../context/app-ctx"
import type { AuthenticatedUser } from "../types/http"

interface AuditLogPayload {
  action: string
  entityType: string
  entityId?: string | null
  details?: Record<string, unknown>
  actor?: AuthenticatedUser
}

export async function writeAuditLog(ctx: AppContext, payload: AuditLogPayload) {
  try {
    await ctx.dbCtx.auditLogs.insertOne({
      _id: new ObjectId(),
      actorUserId: payload.actor?.id ? new ObjectId(payload.actor.id) : null,
      actorRole: payload.actor?.role,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId ?? null,
      details: payload.details ?? {},
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Failed to write audit log", error)
  }
}
