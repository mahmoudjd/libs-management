"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

import LoanList from "@/components/LoanList"
import { PageLayout } from "@/components/page-layout"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DialogShell } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"
import { useUserLoans } from "@/lib/hooks/useUserLoans"
import { useUsers } from "@/lib/hooks/useUsers"
import type { UserRole } from "@/lib/types"

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

export default function UserDetailPage() {
  const params = useParams<{ userId: string }>()
  const userId = params?.userId
  const { data: session, status } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.salesRole === "admin"
  const isSelf = session?.user?.id === userId

  const {
    users,
    isLoading,
    updateRole,
    updatingUserId,
    updateStatus,
    updatingStatusUserId,
    deleteUser,
    isDeletingUser,
  } = useUsers(isAdmin)
  const { loans, isLoading: loansLoading } = useUserLoans(isAdmin ? userId : undefined)

  const [nextRole, setNextRole] = useState<UserRole>("user")
  const [actionError, setActionError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const user = useMemo(() => users.find((item) => item._id === userId), [users, userId])

  useEffect(() => {
    if (user) {
      setNextRole(user.role)
    }
  }, [user])

  const counts = useMemo(() => {
    return {
      active: loans.filter((loan) => loan.status === "active").length,
      overdue: loans.filter((loan) => loan.status === "overdue").length,
      returned: loans.filter((loan) => loan.status === "returned").length,
    }
  }, [loans])

  const handleRoleSave = async () => {
    if (!user) return
    try {
      setActionError(null)
      await updateRole({ userId: user._id, role: nextRole })
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to update role"))
    }
  }

  const handleStatusToggle = async () => {
    if (!user) return
    try {
      setActionError(null)
      await updateStatus({ userId: user._id, disabled: !user.disabled })
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to change account status"))
    }
  }

  const handleDelete = async () => {
    if (!user) return
    try {
      setActionError(null)
      await deleteUser(user._id)
      router.push("/users")
    } catch (error) {
      setActionError(getApiErrorMessage(error, "Failed to delete user"))
    }
  }

  if (isLoading || status === "loading") {
    return (
      <PageLayout title="User">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </PageLayout>
    )
  }

  if (!user) {
    return (
      <PageLayout title="User">
        <Alert variant="error">This user does not exist, or was already deleted.</Alert>
        <Link href="/users" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
          Back to users
        </Link>
      </PageLayout>
    )
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
  const isBusy = updatingUserId === user._id || updatingStatusUserId === user._id || isDeletingUser

  return (
    <PageLayout
      title={`${user.firstName} ${user.lastName}`}
      description={user.email}
      actions={
        <Link
          href="/users"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeftIcon aria-hidden="true" className="h-4 w-4" />
          Back to users
        </Link>
      }
    >
      {actionError && (
        <Alert variant="error" className="mb-6">
          {actionError}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent>
              <div className="mb-6 flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-soft text-lg font-semibold text-primary"
                >
                  {initials || "?"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="ml-auto flex flex-col items-end gap-1">
                  <Badge variant={user.role === "admin" ? "destructive" : user.role === "librarian" ? "warning" : "secondary"}>
                    {user.role}
                  </Badge>
                  <Badge variant={user.disabled ? "secondary" : "success"}>
                    {user.disabled ? "disabled" : "active"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <div>
                  <label htmlFor="detail-role" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Role
                  </label>
                  <div className="flex gap-2">
                    <Select
                      id="detail-role"
                      value={nextRole}
                      onChange={(event) => setNextRole(event.target.value as UserRole)}
                      disabled={isBusy}
                    >
                      <option value="user">user</option>
                      <option value="librarian">librarian</option>
                      <option value="admin">admin</option>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={handleRoleSave}
                      disabled={isBusy || nextRole === user.role}
                    >
                      {updatingUserId === user._id ? "Saving..." : "Save role"}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Account status</p>
                    <p className="text-xs text-muted-foreground">
                      {user.disabled
                        ? "This account cannot sign in. History is preserved."
                        : "Disabling blocks sign-in but keeps loans and history."}
                    </p>
                  </div>
                  <Button
                    variant={user.disabled ? "success" : "outline"}
                    onClick={handleStatusToggle}
                    disabled={isBusy || isSelf}
                    title={isSelf ? "You cannot disable your own account" : undefined}
                  >
                    {updatingStatusUserId === user._id
                      ? "Saving..."
                      : user.disabled
                        ? "Enable account"
                        : "Disable account"}
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger-soft/40 p-4">
                  <div>
                    <p className="text-sm font-semibold text-danger">Delete permanently</p>
                    <p className="text-xs text-muted-foreground">
                      Blocked while the user has active loans or pending reservations.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isBusy || isSelf}
                    title={isSelf ? "You cannot delete your own account" : undefined}
                  >
                    Delete user
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardContent>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Loan activity</h2>
            <div className="grid grid-cols-3 gap-3">
              <StatTile label="Active" value={counts.active} />
              <StatTile label="Overdue" value={counts.overdue} />
              <StatTile label="Returned" value={counts.returned} />
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Loans</h2>
        {loansLoading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : (
          <LoanList
            loans={loans}
            readOnly
            isLoggedIn
            isStaff
            emptyStateText="This user has not borrowed anything yet."
          />
        )}
      </section>

      <DialogShell
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete user"
        error={actionError}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeletingUser}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeletingUser}>
              {isDeletingUser ? "Deleting..." : "Delete permanently"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Permanently delete{" "}
          <span className="font-semibold text-foreground">
            {user.firstName} {user.lastName}
          </span>
          ? Their loan history loses its owner and this cannot be undone. Disable the account
          instead if you may need it back.
        </p>
      </DialogShell>
    </PageLayout>
  )
}
