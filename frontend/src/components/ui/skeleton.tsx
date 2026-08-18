import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            aria-hidden="true"
            className={cn("animate-pulse rounded-lg bg-surface-muted", className)}
            {...props}
        />
    );
}

/** Placeholder grid matching GridList, used while cards load. */
export function SkeletonCards({ count = 6 }: { count?: number }) {
    return (
        <div
            role="status"
            aria-label="Loading"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="rounded-2xl border border-border bg-surface p-5">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="mt-3 h-4 w-1/2" />
                    <Skeleton className="mt-2 h-4 w-2/5" />
                    <div className="mt-6 flex items-center justify-between">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-9 w-24 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}
