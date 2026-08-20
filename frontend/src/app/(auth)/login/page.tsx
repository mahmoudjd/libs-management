"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  // proxy.ts adds this when it bounces an unauthenticated user off a protected route.
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (response?.error) {
        setError("Those credentials did not match an account.")
      } else {
        router.push(callbackUrl)
      }
    } catch {
      setError("Could not sign you in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to borrow books and manage your loans.
          </p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <Field label="Email" htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field label="Password" htmlFor="login-password">
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            <ArrowRightOnRectangleIcon
              aria-hidden="true"
              className={loading ? "h-5 w-5 animate-spin" : "h-5 w-5"}
            />
            {loading ? "Signing in..." : "Sign in"}
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
          onClick={() => signIn("google", { callbackUrl })}
        >
          Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          No account yet?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary above it.
  return (
    <Suspense fallback={<Card className="h-96 w-full max-w-md" />}>
      <LoginForm />
    </Suspense>
  )
}
