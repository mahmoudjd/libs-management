"use client";

import React from "react";
import Link from "next/link";
import {useSession, signIn, signOut} from "next-auth/react";
import {Button} from "@/components/ui/button";
import {NavigationDropdown} from "@/components/NavigationDropdown";
import {ContentContainer} from "@/components/layout/content-container";
import {getNavigationItems} from "@/components/navigation/navigation-items";

export default function Header() {
    const {data: session, status} = useSession();
    const role = session?.user?.salesRole;
    const isAdmin = role === "admin";
    const isStaff = role === "admin" || role === "librarian";
    const isAuthenticated = Boolean(session?.user);
    const username = session?.user?.firstName + " " + session?.user?.lastName;
    const navigationItems = getNavigationItems({
        isAuthenticated,
        isAdmin,
        isStaff,
    });

    return (
        <header className="bg-white shadow-md">
            <ContentContainer className="flex h-16 items-center justify-between">

                <Link href="/dashboard" className="text-xl font-bold text-blue-600 flex items-center gap-2">
                    📚 <span>MyLibrary</span>
                </Link>

                <NavigationDropdown items={navigationItems}/>
                <nav className="hidden lg:flex items-center gap-6">
                    {navigationItems.map((item) => (
                        <Link key={item.href} href={item.href}
                              className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
                            <item.Icon className="h-5 w-5"/>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-4">
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
            </ContentContainer>
        </header>
    );
}
