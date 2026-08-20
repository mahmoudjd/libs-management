import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Users",
    description: "Manage roles, account status and access.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
