import {cn} from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
}

export function Card({className, ...props}: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border-none bg-white text-gray-900 shadow-sm",
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
                "p-6",
                className
            )}
            {...props}
        />
    );
}
