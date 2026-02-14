"use client";

import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ListBulletIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { NavigationItem } from "@/components/navigation/navigation-items";

interface NavigationDropdownProps {
    items: NavigationItem[];
}

export const NavigationDropdown: React.FC<NavigationDropdownProps> = ({ items }) => {
    const { data: session } = useSession();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex md:hidden">
                    <ListBulletIcon className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                side="bottom"
                align="end"
                className="bg-white rounded-lg shadow-lg ring-1 ring-gray-900/10 w-56 p-3 space-y-2 mt-2">

                {items.map((item) => (
                    <DropdownMenuItem asChild key={item.href}>
                        <Link href={item.href} className="flex items-center gap-2 text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-md px-2 py-1 transition duration-200 ease-in-out">
                            <item.Icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    </DropdownMenuItem>
                ))}

                <DropdownMenuItem asChild>
                    {session ? (
                        <Button variant="ghost" className="w-full justify-start text-gray-800 hover:bg-red-50 hover:text-red-600 transition duration-200 ease-in-out" onClick={() => signOut()}>
                            Logout
                        </Button>
                    ) : (
                        <Button variant="ghost" className="w-full justify-start text-gray-800 hover:bg-green-50 hover:text-green-600 transition duration-200 ease-in-out" onClick={() => signIn()}>
                            Login
                        </Button>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
