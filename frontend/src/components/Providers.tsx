"use client";

import {SessionProvider} from "next-auth/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactNode, useState} from "react";

export default function Providers({
                                      children,
                                      session,
                                  }: {
    children: ReactNode;
    session: any;
}) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <SessionProvider session={session}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </SessionProvider>
    );
}
