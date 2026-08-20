import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "My Profile",
    description: "Your account details and library activity.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
