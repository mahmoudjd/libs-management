import { cn } from "@/lib/utils";

interface GridListProps {
    children: React.ReactNode;
    className?: string;
}

export function GridList({children, className}: GridListProps) {
    return (
        <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
            {children}
        </div>
    );
}
