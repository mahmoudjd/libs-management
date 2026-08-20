import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Books",
    description: "Search the catalogue, borrow available titles and reserve the ones that are out.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children
}
