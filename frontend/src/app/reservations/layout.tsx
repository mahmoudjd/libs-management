import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Reservations",
    description: "The waiting queue for books that are currently out.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
