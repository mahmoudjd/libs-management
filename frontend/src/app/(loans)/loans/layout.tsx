import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Loans",
    description: "Track loans, due dates and extensions.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
