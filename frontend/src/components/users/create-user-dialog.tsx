import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { DialogShell } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { CreateUserRequest, UserRole } from "@/lib/types"

type CreateUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (user: CreateUserRequest) => Promise<void>
  isSubmitting?: boolean
  error?: string | null
}

const EMPTY_FORM: CreateUserRequest = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "user",
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  error,
}) => {
  const [form, setForm] = useState<CreateUserRequest>(EMPTY_FORM)

  // Reset on open, so a failed submit keeps what the admin typed.
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM)
    }
  }, [open])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await onSubmit(form)
  }

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Create user"
      description="The account is active immediately and can sign in with this password."
      error={error}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="create-user-form" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create user"}
          </Button>
        </div>
      }
    >
      <form id="create-user-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="create-user-first-name">
            <Input
              id="create-user-first-name"
              value={form.firstName}
              onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
              required
              disabled={isSubmitting}
            />
          </Field>
          <Field label="Last name" htmlFor="create-user-last-name">
            <Input
              id="create-user-last-name"
              value={form.lastName}
              onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
              required
              disabled={isSubmitting}
            />
          </Field>
        </div>

        <Field label="Email" htmlFor="create-user-email">
          <Input
            id="create-user-email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
            disabled={isSubmitting}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="create-user-password"
          hint="At least 8 characters. Share it with the user so they can sign in."
        >
          <Input
            id="create-user-password"
            type="text"
            minLength={8}
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
            disabled={isSubmitting}
          />
        </Field>

        <Field label="Role" htmlFor="create-user-role">
          <Select
            id="create-user-role"
            value={form.role}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))
            }
            disabled={isSubmitting}
          >
            <option value="user">user</option>
            <option value="librarian">librarian</option>
            <option value="admin">admin</option>
          </Select>
        </Field>
      </form>
    </DialogShell>
  )
}

export default CreateUserDialog
