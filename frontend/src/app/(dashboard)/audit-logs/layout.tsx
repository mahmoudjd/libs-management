import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Audit Logs",
    description: "Every change made to books, loans, reservations and users.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
