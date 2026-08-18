"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowDownTrayIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"

import UserCard from "@/components/users/user-card"
import { PageLayout } from "@/components/page-layout"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { GridList } from "@/components/ui/grid-list"
import { Input } from "@/components/ui/input"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"
import { useCsvExport } from "@/lib/hooks/useCsvExport"
import { useUsers } from "@/lib/hooks/useUsers"
import type { UserRole } from "@/lib/types"

type RoleFilter = "all" | UserRole

const roleFilterOptions: Array<{ value: RoleFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "user", label: "Users" },
    { value: "librarian", label: "Librarians" },
    { value: "admin", label: "Admins" },
]

export default function UsersPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const isAdmin = session?.user?.salesRole === "admin"

    const { users, isLoading, error, updateRole, updatingUserId } = useUsers(isAdmin)
    const { exportFile, exportingFile, exportError } = useCsvExport()
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
    const [actionError, setActionError] = useState<string | null>(null)

    useEffect(() => {
        if (status === "loading") {
            return
        }
        if (!session || session.user.salesRole !== "admin") {
            router.push("/")
        }
    }, [session, status, router])

    const visibleUsers = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase()

        return users.filter((user) => {
            if (roleFilter !== "all" && user.role !== roleFilter) {
                return false
            }
            if (normalizedQuery === "") {
                return true
            }
            return `${user.firstName} ${user.lastName} ${user.email}`
                .toLowerCase()
                .includes(normalizedQuery)
        })
    }, [users, roleFilter, searchQuery])

    const handleUpdateRole = async (userId: string, role: UserRole) => {
        try {
            setActionError(null)
            await updateRole({ userId, role })
        } catch (updateError) {
            setActionError(getApiErrorMessage(updateError, "Failed to update user role"))
        }
    }

    if (!isAdmin) {
        return null
    }

    return (
        <PageLayout
            title="Users"
            description="Manage who can borrow, who can run the desk and who administers the system."
            actions={
                <Button
                    variant="outline"
                    onClick={() => exportFile("users.csv")}
                    disabled={exportingFile !== null}
                >
                    <ArrowDownTrayIcon aria-hidden="true" className="h-4 w-4" />
                    {exportingFile === "users.csv" ? "Exporting..." : "Export users CSV"}
                </Button>
            }
        >
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                    <label htmlFor="user-search" className="sr-only">
                        Search users
                    </label>
                    <MagnifyingGlassIcon
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        id="user-search"
                        type="search"
                        className="pl-9"
                        placeholder="Search by name or email"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </div>
                <SegmentedControl
                    label="Filter users by role"
                    options={roleFilterOptions}
                    value={roleFilter}
                    onChange={setRoleFilter}
                />
            </div>

            {(error || actionError || exportError) && (
                <Alert variant="error" className="mb-6">
                    {actionError ?? exportError ?? "Failed to load users"}
                </Alert>
            )}

            {isLoading ? (
                <GridList>
                    {Array.from({ length: 6 }, (_, index) => (
                        <Skeleton key={index} className="h-40 w-full rounded-2xl" />
                    ))}
                </GridList>
            ) : visibleUsers.length === 0 ? (
                <EmptyState
                    title="No users found"
                    description="Try a different search term or role filter."
                />
            ) : (
                <GridList>
                    {visibleUsers.map((user) => (
                        <UserCard
                            key={user._id}
                            user={user}
                            canEditRole
                            onUpdateRole={handleUpdateRole}
                            isUpdating={updatingUserId === user._id}
                        />
                    ))}
                </GridList>
            )}
        </PageLayout>
    )
}
