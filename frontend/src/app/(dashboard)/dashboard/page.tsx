"use client";

import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useBooks} from "@/lib/hooks/useBooks";
import {useLoans} from "@/lib/hooks/useLoans";
import {apiClient} from "@/lib/apiClient";
import {PageLayout} from "@/components/page-layout";
import {GridList} from "@/components/ui/grid-list";

export default function Dashboard() {
    const {data: session} = useSession();
    const router = useRouter();

    const {books, isLoading: booksLoading} = useBooks();
    const {allLoans, userLoans, isLoading: loansLoading} = useLoans(books);

    const [userCount, setUserCount] = useState<number>(0);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await apiClient.get("/auth/users"); // API Endpoint für User-Liste
                setUserCount(response.data.length);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        if (session?.user?.salesRole === "admin") {
            fetchUsers();
        }
    }, [session]);

    if (booksLoading || loansLoading) {
        return <div className="p-6">Loading Dashboard...</div>;
    }

    if (session?.user?.salesRole === "admin") {
        return (
            <PageLayout title="Admin Dashboard">

                <GridList>
                    {/* Total Books Box */}
                    <div
                        className="p-6 bg-white rounded-xl shadow-md flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => router.push("/books")}
                    >
                        <h2 className="text-lg font-semibold mb-2">Total Books</h2>
                        <p className="text-3xl">{books.length}</p>
                    </div>

                    {/* Total Users Box */}
                    <div
                        className="p-6 bg-white rounded-xl shadow-md flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => router.push("/users")}>
                        <h2 className="text-lg font-semibold mb-2">Total Users</h2>
                        <p className="text-3xl">{userCount}</p>
                    </div>

                    {/* All Loans Box */}
                    <div
                        className="p-6 bg-white rounded-xl shadow-md flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => router.push("/loans")}
                    >
                        <h2 className="text-lg font-semibold mb-2">All Loans</h2>
                        <p className="text-3xl">{allLoans.length}</p>
                    </div>
                </GridList>
            </PageLayout>
        );
    }

    // User Dashboard
    return (
        <PageLayout title="User Dashboard">

            <GridList>
                {/* Total Books Box */}
                <div
                    className="p-6 bg-white rounded-xl shadow-md flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => router.push("/books")}
                >
                    <h2 className="text-lg font-semibold mb-2">Total Books</h2>
                    <p className="text-3xl">{books.length}</p>
                </div>

                {/* My Loans Box */}
                <div
                    className="p-6 bg-white rounded-xl shadow-md flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => router.push("/loans")}
                >
                    <h2 className="text-lg font-semibold mb-2">My Loans</h2>
                    <p className="text-3xl">{userLoans.length}</p>
                </div>

                {/* User Info Box */}
                <div className="p-6 bg-white rounded-xl shadow-md flex flex-col items-center justify-center">
                    <h2 className="text-lg font-semibold mb-2">User Info</h2>
                    <p className="text-sm">Name: {session?.user?.name}</p>
                    <p className="text-sm">Email: {session?.user?.email}</p>
                </div>
            </GridList>
        </PageLayout>
    );
}
