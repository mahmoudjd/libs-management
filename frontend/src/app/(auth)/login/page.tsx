"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!email || !password) {
      setError("Bitte füllen Sie alle Felder aus.")
      setLoading(false)
      return
    }

    try {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (response?.error) {
        setError("Falsche Anmeldedaten.")
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError("Fehler beim Login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Willkommen zurück</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Melden Sie sich an, um Bücher auszuleihen und zu verwalten.
            </p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleLogin} className="space-y-4">
            <Field label="E-Mail" htmlFor="login-email">
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

            <Field label="Passwort" htmlFor="login-password">
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
              {loading ? "Anmelden..." : "Login"}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">Oder mit</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            disabled={loading}
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Google Login
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Noch kein Konto?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Registrieren
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
