import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";

import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "info";

const variantStyles: Record<AlertVariant, string> = {
    error: "border-danger/30 bg-danger-soft text-danger",
    success: "border-success/30 bg-success-soft text-success",
    info: "border-border bg-surface-muted text-muted-foreground",
};

const variantIcons: Record<AlertVariant, typeof InformationCircleIcon> = {
    error: ExclamationTriangleIcon,
    success: CheckCircleIcon,
    info: InformationCircleIcon,
};

type AlertProps = {
    variant?: AlertVariant;
    children: React.ReactNode;
    className?: string;
};

export function Alert({ variant = "info", children, className }: AlertProps) {
    const Icon = variantIcons[variant];

    return (
        <div
            role={variant === "error" ? "alert" : "status"}
            className={cn(
                "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm",
                variantStyles[variant],
                className
            )}
        >
            <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0">{children}</div>
        </div>
    );
}
