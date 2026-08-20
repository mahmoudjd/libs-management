import type { Metadata } from "next";
import "./globals.css";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import Providers from "@/components/Providers";
import Header from "@/components/header";
import { ContentContainer } from "@/components/layout/content-container";
import { THEME_STORAGE_KEY } from "@/components/theme-toggle";

export const metadata: Metadata = {
    // Per-route layouts supply the page name; this frames it consistently.
    title: {
        default: "MyLibrary",
        template: "%s · MyLibrary",
    },
    description: "A modern system for managing a library",
};

/** Runs before paint so the stored theme never flashes the wrong colours. */
const themeBootScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY
)});var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export default async function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession(authOptions)

    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <script dangerouslySetInnerHTML={{__html: themeBootScript}}/>
        </head>
        <body className="min-h-screen bg-background antialiased">
        <Providers session={session}>
            <Header/>
            <main className="min-h-[calc(100vh-4rem)]">
                <ContentContainer>
                    {children}
                </ContentContainer>
            </main>
        </Providers>
        </body>
        </html>
    );
}
