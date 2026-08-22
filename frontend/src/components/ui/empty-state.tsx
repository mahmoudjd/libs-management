import { InboxIcon } from "@heroicons/react/24/outline";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
    title: string;
    description?: string;
    /** Defaults to a neutral inbox glyph; pass a page-specific one where it helps. */
    Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    action?: React.ReactNode;
    className?: string;
};

export function EmptyState({
    title,
    description,
    Icon = InboxIcon,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center",
                className
            )}
        >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-muted text-muted-foreground">
                <Icon aria-hidden="true" className="h-6 w-6" />
            </span>
            <p className="mt-4 text-base font-semibold text-foreground">{title}</p>
            {description && (
                // Capped so a long sentence stays a readable two lines rather than
                // stretching the full width of a wide card.
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
