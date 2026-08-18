import {cn} from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
}

export function Card({className, ...props}: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-border bg-surface text-foreground shadow-sm",
                className
            )}
            {...props}
        />
    );
}


interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
}

export function CardContent({className, ...props}: CardContentProps) {
    return (
        <div
            className={cn(
                "p-5",
                className
            )}
            {...props}
        />
    );
}
