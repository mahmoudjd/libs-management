"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Bars3Icon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { isNavigationItemActive, type NavigationItem } from "@/components/navigation/navigation-items";
import { cn } from "@/lib/utils";

interface NavigationDropdownProps {
    items: NavigationItem[];
}

export const NavigationDropdown: React.FC<NavigationDropdownProps> = ({ items }) => {
    const { data: session } = useSession();
    const pathname = usePathname() ?? "";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex lg:hidden" aria-label="Open menu">
                    <Bars3Icon aria-hidden="true" className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                side="bottom"
                align="end"
                sideOffset={8}
                className="z-50 w-56 rounded-xl border border-border bg-surface p-2 shadow-lg"
            >
                {items.map((item) => {
                    const isActive = isNavigationItemActive(pathname, item.href);

                    return (
                        <DropdownMenuItem asChild key={item.href}>
                            <Link
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm outline-none transition-colors",
                                    isActive
                                        ? "bg-primary-soft text-primary"
                                        : "text-foreground hover:bg-surface-muted"
                                )}
                            >
                                <item.Icon aria-hidden="true" className="h-5 w-5" />
                                {item.label}
                            </Link>
                        </DropdownMenuItem>
                    );
                })}

                <div className="my-1 h-px bg-border" />

                <DropdownMenuItem asChild>
                    {session ? (
                        <Button
                            variant="ghost"
                            className="w-full justify-start hover:bg-danger-soft hover:text-danger"
                            onClick={() => signOut()}
                        >
                            Logout
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            className="w-full justify-start hover:bg-primary-soft hover:text-primary"
                            onClick={() => signIn()}
                        >
                            Login
                        </Button>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
