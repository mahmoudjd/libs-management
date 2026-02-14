"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { PageLayout } from "@/components/page-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/apiClient"
import type { AuditLog } from "@/lib/types"

export default function AuditLogsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [actionFilter, setActionFilter] = useState("")
  const [entityTypeFilter, setEntityTypeFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get<AuditLog[]>("/audit-logs", {
        params: {
          ...(actionFilter ? { action: actionFilter } : {}),
          ...(entityTypeFilter ? { entityType: entityTypeFilter } : {}),
        },
      })
      setLogs(response.data)
      setError(null)
    } catch (fetchError) {
      console.error("Failed to load audit logs", fetchError)
      setError("Failed to load audit logs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!session) {
      return
    }

    if (session.user.salesRole !== "admin") {
      router.push("/")
      return
    }

    fetchLogs()
  }, [session, router])

  return (
    <PageLayout title="Audit Logs">
      <div className="mb-4 flex flex-col md:flex-row gap-2">
        <Input
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value)}
          placeholder="Filter by action (e.g. loan.created)"
        />
        <Input
          value={entityTypeFilter}
          onChange={(event) => setEntityTypeFilter(event.target.value)}
          placeholder="Filter by entity type (e.g. book)"
        />
        <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
          {isLoading ? "Loading..." : "Apply Filters"}
        </Button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {isLoading ? (
        <p>Loading audit logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No audit logs found.</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log._id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{log.action}</Badge>
                <Badge variant="default">{log.entityType}</Badge>
                <span className="text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                actor: {log.actorUserId ?? "system"} ({log.actorRole ?? "unknown"})
              </p>
              {log.entityId && (
                <p className="text-sm text-gray-700">entityId: {log.entityId}</p>
              )}
              <pre className="mt-2 rounded bg-gray-50 p-2 text-xs overflow-x-auto">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
