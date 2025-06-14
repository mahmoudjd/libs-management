"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

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
      });

      if (response?.error) {
        setError("Falsche Anmeldedaten.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Fehler beim Login.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6 w-full max-w-md space-y-4">
          <h2 className="text-2xl text-center text-black">Willkommen zurück</h2>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <form onSubmit={handleLogin} className="flex flex-col space-y-4">
            <Input
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white flex h-12 items-center justify-center rounded gap-2 hover:bg-blue-500 transition disabled:opacity-50"
            >
              {loading ? (
                  <ArrowRightOnRectangleIcon className="h-5 w-5 animate-spin" />
              ) : (
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
              )}
              Login
            </Button>
          </form>

          <div className="my-4 text-center text-gray-500">Oder mit</div>

          <Button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full bg-red-500 text-white flex justify-center items-center h-12 rounded hover:bg-red-600 transition"
          >
            Google Login
          </Button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Noch kein Konto?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Registrieren
            </a>
          </p>
        </Card>
      </div>
  );
}
