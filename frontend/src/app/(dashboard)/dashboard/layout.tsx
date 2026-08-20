import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Key numbers across the library.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
