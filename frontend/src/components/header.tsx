"use client";

import React from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { NavigationDropdown } from "@/components/NavigationDropdown"; // Hier importieren wir die Dropdown-Komponente
import {
    BookOpenIcon,
    ClipboardDocumentListIcon,
    HomeIcon,
    ShieldCheckIcon,
    UsersIcon
} from "@heroicons/react/24/outline"; // Heroicons Import

export default function Header() {
    const { data: session, status } = useSession();
    const role = session?.user?.salesRole;
    const isAdmin = role === "admin";
    const isStaff = role === "admin" || role === "librarian";
    const username = session?.user?.firstName + " " + session?.user?.lastName;

    return (
        <header className="bg-white shadow-md p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                <Link href="/dashboard" className="text-xl font-bold text-blue-600 flex items-center gap-2">
                    📚 <span>MyLibrary</span>
                </Link>

                <NavigationDropdown isAdmin={isAdmin} isStaff={isStaff} />
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
                        <HomeIcon className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link href="/books" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
                        <BookOpenIcon className="h-5 w-5" />
                        Books
                    </Link>
                    {session && (
                        <Link href="/loans" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
                            <ClipboardDocumentListIcon className="h-5 w-5" />
                            {isStaff ? "All Loans" : "My Loans"}
                        </Link>
                    )}
                    {isAdmin && (
                        <>
                            <Link href="/users" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
                                <UsersIcon className="h-5 w-5" />
                                Users
                            </Link>
                            <Link href="/audit-logs" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
                                <ShieldCheckIcon className="h-5 w-5" />
                                Audit
                            </Link>
                        </>
                    )}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    {status === "loading" ? (
                        <span className="text-gray-500 text-sm">Loading...</span>
                    ) : session ? (
                        <>
              <span className="text-sm text-gray-600">
                Hi, {username}
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
            </div>
        </header>
    );
}
