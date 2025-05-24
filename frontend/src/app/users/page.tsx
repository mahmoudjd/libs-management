"use client";

import React, {useEffect, useState} from "react";
import {apiClient} from "@/lib/apiClient";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import UserCard from "@/components/users/user-card";
import {GridList} from "@/components/ui/grid-list";
import {PageLayout} from "@/components/page-layout";

type User = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
};

export default function UsersPage() {
    const {data: session} = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) return;

        if (session?.user?.salesRole !== "admin") {
            router.push("/"); // Redirect if not admin
        } else {
            fetchUsers();
        }
    }, [session]);

    const fetchUsers = async () => {
        try {
            const response = await apiClient.get("/auth/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6">Loading users...</div>;
    }

    return (
        <PageLayout title="All Users" >
            <GridList>
                {users.map((user) => (
                    <UserCard key={user._id} user={user}/>
                ))}
            </GridList>
        </PageLayout>
    );
}
