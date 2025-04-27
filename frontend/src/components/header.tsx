"use client";

import React from "react";
import Link from "next/link";
import {useSession, signIn, signOut} from "next-auth/react";
import {Button} from "@/components/ui/button";

export default function Header() {
    const {data: session, status} = useSession();
    const isAdmin = session?.user?.salesRole === "admin";
    const username = session?.user?.firstName+ " "+ session?.user?.lastName

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
            {/* Left Side - Logo and Navigation */}
            <div className="flex items-center gap-6">
                {/* Logo */}
                <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                    📚 MyLibrary
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                        Dashboard
                    </Link>
                    <Link href="/books" className="text-gray-700 hover:text-blue-600">
                        Books
                    </Link>
                    {session && (
                        <>
                            {!isAdmin && (
                                <Link href="/loans" className="text-gray-700 hover:text-blue-600">
                                    My Loans
                                </Link>
                            )}
                            {isAdmin && (
                                <Link href="/loans" className="text-gray-700 hover:text-blue-600">
                                    All Loans
                                </Link>
                            )}
                        </>
                    )}
                </nav>
            </div>

            {/* Right Side - Auth Buttons */}
            <div className="flex items-center gap-4">
                {status === "loading" ? (
                    <span className="text-gray-500">Loading...</span>
                ) : session ? (
                    <>
                        <span className="text-sm text-gray-600">
                            Hi, {username}
                        </span>
                        <Button variant="outline" onClick={() => signOut()}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <Button variant="default" onClick={() => signIn()}>
                        Login
                    </Button>
                )}
            </div>
        </header>
    );
}
