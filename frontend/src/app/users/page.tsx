"use client";

import React, {useEffect, useState} from "react";
import {apiClient} from "@/lib/apiClient";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import UserCard from "@/components/users/user-card";

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
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">All Users</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                    <UserCard key={user._id} user={user}/>
                ))}
            </div>
        </div>
    );
}
