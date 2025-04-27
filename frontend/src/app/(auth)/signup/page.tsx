"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowRightOnRectangleIcon, EnvelopeIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/solid"
import { signupUser } from "@/lib/hooks/signup"
import {Input} from "@/components/ui/input";
import {Card} from "@/components/ui/card";
import {PasswordInput} from "@/components/ui/password-input";

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
      setError("Bitte füllen Sie alle Felder aus.")
      setLoading(false)
      return
    }

    try {
      const response = await signupUser({
        email,
        password,
        firstName,
        lastName
      });

      if (!response) {
        setError("Fehler bei der Registrierung.");
      } else {
        // Auto-login after successful signup
        const loginResponse = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginResponse?.error) {
          setError("Registrierung erfolgreich, aber automatische Anmeldung fehlgeschlagen. Bitte melden Sie sich an.");
          router.push("/login");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError("Fehler bei der Registrierung.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full flex flex-col space-y-2 max-w-md shadow-xl p-6">
        <h2 className="text-2xl text-center text-black">Konto erstellen</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSignup} className="flex flex-col space-y-4">
          {/* First Name */}
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
                type="text"
                placeholder="Vorname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-10"
            />
          </div>

          {/* Last Name */}
          <div className="relative">
            <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
                type="text"
                placeholder="Nachname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pl-10"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <PasswordInput
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
            />
          </div>

          {/* Submit Button */}
          <button
              type="submit"
              className="bg-blue-600 text-white flex h-12 items-center justify-center rounded gap-2 hover:cursor-pointer hover:bg-blue-500"
          >
            {loading ? (
                <ArrowRightOnRectangleIcon className="h-5 w-5 animate-spin" />
            ) : (
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
            )}
            Registrieren
          </button>
        </form>

        <div className="my-4 text-center text-gray-500">Oder mit</div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full bg-red-500 text-white flex justify-center items-center h-12 rounded hover:cursor-pointer hover:bg-red-600"
        >
          Google Registrierung
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Bereits ein Konto?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Anmelden
          </a>
        </p>
      </Card>
    </div>
  );
}