"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowRightOnRectangleIcon, EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/solid"

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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full flex flex-col space-y-2 max-w-md shadow-xl border border-gray-200 rounded-2xl p-6">
          <h2 className="text-2xl text-center text-black">Willkommen zurück</h2>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <form onSubmit={handleLogin} className="flex flex-col space-y-4">
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                  type="email"
                  placeholder="E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full h-12 text-black border border-gray-300 rounded-lg p-2"
              />
            </div>

            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                  type="password"
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 text-black pl-10 border border-gray-300 rounded-lg p-2"
              />
            </div>

            <button
                type="submit"
                className="bg-blue-600 text-white flex h-12 items-center justify-center rounded gap-2 hover:cursor-pointer hover:bg-blue-500"
            >
              {loading ? (
                  <ArrowRightOnRectangleIcon className="h-5 w-5 animate-spin" />
              ) : (
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
              )}
              Login
            </button>
          </form>

          <div className="my-4 text-center text-gray-500">Oder mit</div>

          <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full bg-red-500 text-white flex justify-center items-center h-12 rounded hover:cursor-pointer hover:bg-red-600"
          >
            Google Login
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Noch kein Konto?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Registrieren
            </a>
          </p>
        </div>
      </div>
  );
}
