"use client"

import React, { useDeferredValue, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { PageLayout } from "@/components/page-layout"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuditLogs } from "@/lib/hooks/useAuditLogs"

const PAGE_SIZE = 25

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.salesRole === "admin"

  const [actionFilter, setActionFilter] = useState("")
  const [entityTypeFilter, setEntityTypeFilter] = useState("")
  const [page, setPage] = useState(1)

  // Deferred so typing does not fire a request per keystroke.
  const deferredActionFilter = useDeferredValue(actionFilter)
  const deferredEntityTypeFilter = useDeferredValue(entityTypeFilter)

  const { logs, total, totalPages, isLoading, isFetching, error } = useAuditLogs(
    {
      action: deferredActionFilter,
      entityType: deferredEntityTypeFilter,
      page,
      pageSize: PAGE_SIZE,
    },
    isAdmin
  )

  useEffect(() => {
    setPage(1)
  }, [deferredActionFilter, deferredEntityTypeFilter])

  useEffect(() => {
    if (status === "loading") {
      return
    }
    if (!session || session.user.salesRole !== "admin") {
      router.push("/")
    }
  }, [session, status, router])

  if (!isAdmin) {
    return null
  }

  return (
    <PageLayout
      title="Audit Logs"
      description="Every change made to books, loans, reservations and users."
    >
      <Card className="mb-6">
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="audit-action" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Action
            </label>
            <Input
              id="audit-action"
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              placeholder="e.g. loan.created"
            />
          </div>
          <div>
            <label htmlFor="audit-entity-type" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Entity type
            </label>
            <Input
              id="audit-entity-type"
              value={entityTypeFilter}
              onChange={(event) => setEntityTypeFilter(event.target.value)}
              placeholder="e.g. book"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="error" className="mb-6">
          Failed to load audit logs.
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description="Nothing matches these filters yet."
        />
      ) : (
        <>
          <div className={isFetching ? "space-y-3 opacity-60 transition-opacity" : "space-y-3"}>
            {logs.map((log) => (
              <div key={log._id} className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="default">{log.action}</Badge>
                  <Badge variant="secondary">{log.entityType}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Actor: {log.actorUserId ?? "system"} ({log.actorRole ?? "unknown"})
                  {log.entityId && ` · Entity: ${log.entityId}`}
                </p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-muted p-2 font-mono text-xs text-muted-foreground">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              shownCount={logs.length}
              itemLabel="log entries"
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </PageLayout>
  )
}
