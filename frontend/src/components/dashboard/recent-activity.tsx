"use client"

import React from "react"
import Link from "next/link"
import {
    ArrowRightIcon,
    BookOpenIcon,
    BookmarkIcon,
    ClipboardDocumentListIcon,
    UserIcon,
} from "@heroicons/react/24/outline"

import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuditLogs } from "@/lib/hooks/useAuditLogs"
import type { AuditLog } from "@/lib/types"

const ENTITY_ICONS: Record<string, typeof BookOpenIcon> = {
    book: BookOpenIcon,
    loan: ClipboardDocumentListIcon,
    reservation: BookmarkIcon,
    user: UserIcon,
}

/** "loan.created" reads as machine output; this turns it into a sentence. */
function toActionLabel(log: AuditLog) {
    const [entity, ...rest] = log.action.split(".")
    const verb = rest.join(" ").replace(/[._]/g, " ")
    return `${entity} ${verb}`.trim()
}

function toRelativeTime(value: string) {
    const deltaMs = Date.now() - new Date(value).getTime()
    const minutes = Math.round(deltaMs / 60_000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.round(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.round(hours / 24)
    if (days < 30) return `${days}d ago`

    return new Date(value).toLocaleDateString()
}

export function RecentActivity({ enabled }: { enabled: boolean }) {
    const { logs, isLoading, error } = useAuditLogs({ page: 1, pageSize: 8 }, enabled)

    return (
        <Card className="mt-8">
            <CardContent>
                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
                        <p className="text-sm text-muted-foreground">
                            The latest changes across books, loans, reservations and users.
                        </p>
                    </div>
                    <Link
                        href="/audit-logs"
                        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                        View all
                        <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }, (_, index) => (
                            <Skeleton key={index} className="h-12 w-full rounded-xl" />
                        ))}
                    </div>
                ) : error ? (
                    <p className="text-sm text-muted-foreground">Could not load recent activity.</p>
                ) : logs.length === 0 ? (
                    <EmptyState title="Nothing has happened yet" />
                ) : (
                    <ul className="divide-y divide-border">
                        {logs.map((log) => {
                            const Icon = ENTITY_ICONS[log.entityType] ?? ClipboardDocumentListIcon

                            return (
                                <li key={log._id} className="flex items-center gap-3 py-2.5">
                                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-muted text-muted-foreground">
                                        <Icon aria-hidden="true" className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium capitalize text-foreground">
                                            {toActionLabel(log)}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            by {log.actorRole ?? "system"}
                                        </p>
                                    </div>
                                    <time
                                        dateTime={String(log.createdAt)}
                                        className="shrink-0 text-xs text-muted-foreground"
                                    >
                                        {toRelativeTime(String(log.createdAt))}
                                    </time>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
