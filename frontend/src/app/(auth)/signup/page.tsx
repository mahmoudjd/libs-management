"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { UserPlusIcon } from "@heroicons/react/24/outline"

import { signupUser } from "@/lib/hooks/signup"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!email || !password || !firstName || !lastName) {
      setError("Please fill in every field.")
      setLoading(false)
      return
    }

    try {
      const response = await signupUser({ email, password, firstName, lastName })

      if (!response) {
        setError("Could not create the account.")
      } else {
        const loginResponse = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (loginResponse?.error) {
          setError(
            "Account created, but signing you in automatically failed. Please sign in."
          )
          router.push("/login")
        } else {
          router.push("/dashboard")
        }
      }
    } catch {
      setError("Could not create the account.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Get access to the whole catalogue in seconds.
            </p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor="signup-first-name">
                <Input
                  id="signup-first-name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </Field>
              <Field label="Last name" htmlFor="signup-last-name">
                <Input
                  id="signup-last-name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </Field>
            </div>

            <Field label="Email" htmlFor="signup-email">
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field label="Password" htmlFor="signup-password" hint="At least 8 characters.">
              <PasswordInput
                id="signup-password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              <UserPlusIcon
                aria-hidden="true"
                className={loading ? "h-5 w-5 animate-spin" : "h-5 w-5"}
              />
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled={loading}
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
    </Card>
  )
}
