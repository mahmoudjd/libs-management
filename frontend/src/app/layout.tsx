import type {Metadata} from "next";
import "./globals.css";
import {authOptions} from "@/auth";
import {getServerSession} from "next-auth";
import Providers from "@/components/Providers";
import Header from "@/components/header";

export const metadata: Metadata = {
    title: "Library Management System",
    description: "A modern system for managing a library",
};

export default async function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession(authOptions)

    return (
        <html lang="en">
        <body
            className="antialiased"
        >
        <Providers session={session}>
            <Header/>
            <main className="flex-grow bg-slate-50 min-h-screen">
                {children}
            </main>
        </Providers>
        </body>
        </html>
    );
}
