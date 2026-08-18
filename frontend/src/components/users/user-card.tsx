import React, { useEffect, useId, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import type { ApiUser, UserRole } from "@/lib/types"

type UserCardProps = {
    user: ApiUser
    canEditRole?: boolean
    onUpdateRole?: (userId: string, nextRole: UserRole) => Promise<void>
    isUpdating?: boolean
}

const UserCard: React.FC<UserCardProps> = ({
    user,
    canEditRole = false,
    onUpdateRole,
    isUpdating = false,
}) => {
    const [nextRole, setNextRole] = useState(user.role)
    const roleSelectId = useId()

    useEffect(() => {
        setNextRole(user.role)
    }, [user.role])

    const badgeVariant =
        user.role === "admin"
            ? "destructive"
            : user.role === "librarian"
                ? "warning"
                : "secondary"

    const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()

    return (
        <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span
                            aria-hidden="true"
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
                        >
                            {initials || "?"}
                        </span>
                        <div className="min-w-0">
                            <h2 className="truncate text-base font-semibold text-foreground">
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    <Badge variant={badgeVariant}>{user.role}</Badge>
                </div>

                {canEditRole && onUpdateRole && (
                    <div className="mt-auto border-t border-border pt-4">
                        <label htmlFor={roleSelectId} className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            Role
                        </label>
                        <div className="flex gap-2">
                            <Select
                                id={roleSelectId}
                                value={nextRole}
                                onChange={(event) => setNextRole(event.target.value as UserRole)}
                                disabled={isUpdating}
                            >
                                <option value="user">user</option>
                                <option value="librarian">librarian</option>
                                <option value="admin">admin</option>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => onUpdateRole(user._id, nextRole)}
                                disabled={isUpdating || nextRole === user.role}
                            >
                                {isUpdating ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default UserCard
