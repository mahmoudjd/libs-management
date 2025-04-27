import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

type UserCardProps = {
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
};

const UserCard: React.FC<UserCardProps> = ({user}) => {
    return (
        <Card className="rounded-xl shadow-md hover:shadow-lg transition p-6">
            <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        {user.firstName} {user.lastName }
                    </h2>
                    <Badge
                        variant={user.role === "admin" ? "destructive" : "secondary"}>
                        {user.role}
                    </Badge>
                </div>
                <p className="text-gray-500 text-sm"> {user.email} </p>
            </CardContent>
        </Card>
    );
};

export default UserCard;
