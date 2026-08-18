import { cn } from "@/lib/utils";

type EmptyStateProps = {
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center",
                className
            )}
        >
            <p className="text-lg font-semibold text-foreground">{title}</p>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            {action && <div className="mt-4 flex justify-center">{action}</div>}
        </div>
    );
}
