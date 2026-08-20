import React from "react"

/**
 * Auth pages stand on their own — showing the app chrome (and a Login button)
 * around a login form is noise.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <div className="flex min-h-screen items-center justify-center py-10">{children}</div>
}
