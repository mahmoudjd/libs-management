"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { BookOpenIcon } from "@heroicons/react/24/solid";

import { Button } from "@/components/ui/button";
import { NavigationDropdown } from "@/components/NavigationDropdown";
import { ContentContainer } from "@/components/layout/content-container";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    getNavigationItems,
    isNavigationItemActive,
} from "@/components/navigation/navigation-items";
import { cn } from "@/lib/utils";

const AUTH_ROUTES = new Set(["/login", "/signup"]);

export default function Header() {
    const { data: session, status } = useSession();
    const pathname = usePathname() ?? "";
    const role = session?.user?.salesRole;
    const isAdmin = role === "admin";
    const isStaff = role === "admin" || role === "librarian";
    const isAuthenticated = Boolean(session?.user);
    const username = [session?.user?.firstName, session?.user?.lastName]
        .filter(Boolean)
        .join(" ");
    const navigationItems = getNavigationItems({
        isAuthenticated,
        isAdmin,
        isStaff,
    });

    // Auth pages are self-contained; app chrome (and a Login button) is noise there.
    if (AUTH_ROUTES.has(pathname)) {
        return null;
    }

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
            <ContentContainer className="flex h-16 items-center justify-between gap-4">
                <Link
                    href="/dashboard"
                    className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-foreground"
                >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                        <BookOpenIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span>MyLibrary</span>
                </Link>

                <nav aria-label="Main" className="hidden lg:flex lg:items-center lg:gap-1">
                    {navigationItems.map((item) => {
                        const isActive = isNavigationItemActive(pathname, item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary-soft text-primary"
                                        : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                                )}
                            >
                                <item.Icon aria-hidden="true" className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    <div className="hidden items-center gap-3 lg:flex">
                        {status === "loading" ? (
                            <span className="text-sm text-muted-foreground">Loading...</span>
                        ) : session ? (
                            <>
                                <span className="max-w-40 truncate text-sm text-muted-foreground">
                                    Hi, {username || session.user?.email}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => signOut()}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button variant="default" size="sm" onClick={() => signIn()}>
                                Login
                            </Button>
                        )}
                    </div>

                    <NavigationDropdown items={navigationItems} />
                </div>
            </ContentContainer>
        </header>
    );
}
