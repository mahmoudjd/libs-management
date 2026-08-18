import {cn} from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "secondary" | "destructive" | "warning";
}

export function Badge({className, variant = "default", ...props}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                {
                    "bg-primary-soft text-primary": variant === "default",
                    "bg-success-soft text-success": variant === "success",
                    "bg-surface-muted text-muted-foreground": variant === "secondary",
                    "bg-danger-soft text-danger": variant === "destructive",
                    "bg-warning-soft text-warning": variant === "warning",
                },
                className
            )}
            {...props}
        />
    );
}
