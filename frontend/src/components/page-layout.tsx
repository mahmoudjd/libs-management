import React from "react";

type PageLayoutProps = {
    title: string;
    children: React.ReactNode;
};

export const PageLayout = ({ title, children }: PageLayoutProps) => {
    return (
        <main className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{title}</h1>
            <div>{children}</div>
        </main>
    );
};
