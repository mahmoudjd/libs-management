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
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                gcTime: 5 * 60_000,
                retry: 1,
                refetchOnWindowFocus: false,
                // The API is a first-party service, not an offline-capable one.
                // Under the default "online" mode an unreachable backend parks
                // the query in fetchStatus "paused" and never sets an error, so
                // every list silently renders its empty state instead.
                networkMode: "always",
            },
        },
    }));

    return (
        <SessionProvider session={session}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </SessionProvider>
    );
}
