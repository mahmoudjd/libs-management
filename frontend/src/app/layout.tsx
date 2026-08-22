import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import Providers from "@/components/Providers";
import Header from "@/components/header";
import { ContentContainer } from "@/components/layout/content-container";
import { THEME_STORAGE_KEY } from "@/components/theme-toggle";

const firaSans = Fira_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-fira-sans",
    display: "swap",
});

// Mono carries the numbers in KPIs and tables, so it needs tabular figures.
const firaCode = Fira_Code({
    subsets: ["latin"],
    variable: "--font-fira-code",
    display: "swap",
});

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
        <html lang="en" className={`${firaSans.variable} ${firaCode.variable}`} suppressHydrationWarning>
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
