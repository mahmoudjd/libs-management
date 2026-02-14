"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import UserCard from "@/components/users/user-card"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { GridList } from "@/components/ui/grid-list"
import { apiClient } from "@/lib/apiClient"

type User = {
    _id: string
    firstName: string
    lastName: string
    email: string
    role: "admin" | "librarian" | "user"
}

export default function UsersPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
    const [exporting, setExporting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get<User[]>("/auth/users")
            setUsers(response.data)
            setErrorMessage(null)
        } catch (error) {
            console.error("Failed to fetch users", error)
            setErrorMessage("Failed to load users")
        } finally {
            setLoading(false)
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
        fetchUsers()
    }, [session, router])

    const handleUpdateRole = async (userId: string, role: "admin" | "librarian" | "user") => {
        try {
            setUpdatingUserId(userId)
            await apiClient.patch(`/auth/users/${userId}/role`, { role })
            await fetchUsers()
        } catch (error) {
            console.error("Failed to update user role", error)
            setErrorMessage("Failed to update user role")
        } finally {
            setUpdatingUserId(null)
        }
    }

    const handleExportUsers = async () => {
        try {
            setExporting(true)
            const response = await apiClient.get("/exports/users.csv", {
                responseType: "blob",
            })

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement("a")
            link.href = blobUrl
            link.download = "users.csv"
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(blobUrl)
        } catch (error) {
            console.error("Failed to export users csv", error)
            setErrorMessage("Failed to export users csv")
        } finally {
            setExporting(false)
        }
    }

    if (loading) {
        return <div className="p-6">Loading users...</div>
    }

    return (
        <PageLayout title="All Users">
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={handleExportUsers} disabled={exporting}>
                    {exporting ? "Exporting..." : "Export Users CSV"}
                </Button>
                {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
            </div>
            <GridList>
                {users.map((user) => (
                    <UserCard
                        key={user._id}
                        user={user}
                        canEditRole
                        onUpdateRole={handleUpdateRole}
                        isUpdating={updatingUserId === user._id}
                    />
                ))}
            </GridList>
        </PageLayout>
    )
}
