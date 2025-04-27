import {cn} from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "success" | "secondary" | "destructive" | "warning";
}

export function Badge({className, variant = "default", ...props}: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                {
                    "bg-blue-100 text-blue-800": variant === "default",
                    "bg-green-100 text-green-800": variant === "success",
                    "bg-gray-200 text-gray-800": variant === "secondary",
                    "bg-red-100 text-red-700": variant === "destructive",
                    "bg-yellow-100 text-yellow-800": variant === "warning",  // <-- NEU
                },
                className
            )}
            {...props}
        />
    );
}
