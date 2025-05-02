"use client";

import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ListBulletIcon, HomeIcon, BookOpenIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface NavigationDropdownProps {
    isAdmin: boolean;
}

export const NavigationDropdown: React.FC<NavigationDropdownProps> = ({ isAdmin }) => {
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
                className="bg-white rounded-lg shadow-lg ring-1 ring-gray-900/10 w-48 p-3 space-y-2 mt-2">

                <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-md px-2 py-1 transition duration-200 ease-in-out">
                        <HomeIcon className="h-5 w-5" />
                        Dashboard
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href="/books" className="flex items-center gap-2 text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-md px-2 py-1 transition duration-200 ease-in-out">
                        <BookOpenIcon className="h-5 w-5" />
                        Books
                    </Link>
                </DropdownMenuItem>

                {session && (
                    <DropdownMenuItem asChild>
                        <Link href="/loans" className="flex items-center gap-2 text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-md px-2 py-1 transition duration-200 ease-in-out">
                            <ClipboardDocumentListIcon className="h-5 w-5" />
                            {isAdmin ? "All Loans" : "My Loans"}
                        </Link>
                    </DropdownMenuItem>
                )}

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
