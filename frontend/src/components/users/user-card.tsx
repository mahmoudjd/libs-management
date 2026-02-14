import React, { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type UserCardProps = {
    user: {
        _id: string
        firstName: string
        lastName: string
        email: string
        role: "admin" | "librarian" | "user"
    }
    canEditRole?: boolean
    onUpdateRole?: (userId: string, nextRole: "admin" | "librarian" | "user") => Promise<void>
    isUpdating?: boolean
}

const UserCard: React.FC<UserCardProps> = ({
    user,
    canEditRole = false,
    onUpdateRole,
    isUpdating = false,
}) => {
    const [nextRole, setNextRole] = useState(user.role)

    useEffect(() => {
        setNextRole(user.role)
    }, [user.role])

    const badgeVariant =
        user.role === "admin"
            ? "destructive"
            : user.role === "librarian"
                ? "warning"
                : "secondary"

    return (
        <Card className="rounded-xl shadow-md hover:shadow-lg transition p-6">
            <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        {user.firstName} {user.lastName}
                    </h2>
                    <Badge variant={badgeVariant}>
                        {user.role}
                    </Badge>
                </div>
                <p className="text-gray-500 text-sm">{user.email}</p>
                {canEditRole && onUpdateRole && (
                    <div className="mt-2 flex gap-2">
                        <select
                            value={nextRole}
                            onChange={(event) => setNextRole(event.target.value as "admin" | "librarian" | "user")}
                            className="h-9 rounded-md border border-gray-300 px-3 text-sm"
                            disabled={isUpdating}
                        >
                            <option value="user">user</option>
                            <option value="librarian">librarian</option>
                            <option value="admin">admin</option>
                        </select>
                        <Button
                            variant="outline"
                            onClick={() => onUpdateRole(user._id, nextRole)}
                            disabled={isUpdating || nextRole === user.role}
                        >
                            {isUpdating ? "Saving..." : "Update Role"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default UserCard
