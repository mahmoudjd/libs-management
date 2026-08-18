"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { PageLayout } from "@/components/page-layout"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"
import { useLoans } from "@/lib/hooks/useLoans"
import { useProfile } from "@/lib/hooks/useProfile"
import { useReservations } from "@/lib/hooks/useReservations"

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { profile, isLoading, error, updateProfile, isUpdatingProfile } = useProfile()
  const { userLoans } = useLoans([])
  const { myReservations } = useReservations()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName)
      setLastName(profile.lastName)
      setEmail(profile.email)
    }
  }, [profile])

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login")
    }
  }, [session, status, router])

  const isDirty =
    Boolean(profile) &&
    (firstName !== profile?.firstName || lastName !== profile?.lastName || email !== profile?.email)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setFormError(null)
      setSavedMessage(null)
      await updateProfile({ firstName, lastName, email })
      setSavedMessage("Profile updated.")
    } catch (updateError) {
      setFormError(getApiErrorMessage(updateError, "Failed to update profile"))
    }
  }

  const resetForm = () => {
    if (profile) {
      setFirstName(profile.firstName)
      setLastName(profile.lastName)
      setEmail(profile.email)
      setFormError(null)
      setSavedMessage(null)
    }
  }

  if (!session) {
    return null
  }

  const activeLoans = userLoans.filter((loan) => loan.status === "active").length
  const overdueLoans = userLoans.filter((loan) => loan.status === "overdue").length
  const returnedLoans = userLoans.filter((loan) => loan.status === "returned").length
  const pendingReservations = myReservations.filter(
    (reservation) => reservation.status === "pending"
  ).length

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()

  return (
    <PageLayout title="My Profile" description="Your account details and library activity.">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      ) : error || !profile ? (
        <Alert variant="error">Failed to load your profile. Please refresh the page.</Alert>
      ) : (
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
                    <h2 className="truncate text-xl font-semibold text-foreground">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                  <Badge variant={profile.role === "user" ? "secondary" : "default"} className="ml-auto">
                    {profile.role}
                  </Badge>
                </div>

                {formError && (
                  <Alert variant="error" className="mb-4">
                    {formError}
                  </Alert>
                )}
                {savedMessage && !isDirty && (
                  <Alert variant="success" className="mb-4">
                    {savedMessage}
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="First name" htmlFor="profile-first-name">
                      <Input
                        id="profile-first-name"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                        disabled={isUpdatingProfile}
                      />
                    </Field>
                    <Field label="Last name" htmlFor="profile-last-name">
                      <Input
                        id="profile-last-name"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        required
                        disabled={isUpdatingProfile}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Email"
                    htmlFor="profile-email"
                    hint="Used to sign in, so it has to stay unique."
                  >
                    <Input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      disabled={isUpdatingProfile}
                    />
                  </Field>

                  <div className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      disabled={!isDirty || isUpdatingProfile}
                    >
                      Reset
                    </Button>
                    <Button type="submit" disabled={!isDirty || isUpdatingProfile}>
                      {isUpdatingProfile ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardContent>
              <h2 className="mb-4 text-lg font-semibold text-foreground">My activity</h2>
              <div className="grid grid-cols-2 gap-3">
                <SummaryTile label="Active loans" value={activeLoans} />
                <SummaryTile label="Overdue" value={overdueLoans} />
                <SummaryTile label="Returned" value={returnedLoans} />
                <SummaryTile label="Reservations" value={pendingReservations} />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Your role is set by an administrator and cannot be changed here.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  )
}
