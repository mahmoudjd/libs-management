import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div role="status" aria-label="Loading page" className="py-7 md:py-10">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="mt-3 h-4 w-96 max-w-full" />
            <Skeleton className="mt-7 h-28 w-full rounded-2xl" />
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-48 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    )
}
