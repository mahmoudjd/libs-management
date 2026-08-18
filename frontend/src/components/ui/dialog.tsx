"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type DialogShellProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    /** Rendered as the accessible description; Radix warns when it is missing. */
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    /** Shown inside the panel — a page-level alert would sit behind the overlay. */
    error?: string | null;
    className?: string;
};

/**
 * Shared shell for every dialog: overlay, centered panel, close button and
 * scrolling so long forms stay reachable on short viewports.
 */
export function DialogShell({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    error,
    className,
}: DialogShellProps) {
    return (
        <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
            <RadixDialog.Portal>
                <RadixDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm" />
                <RadixDialog.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-border bg-surface shadow-xl",
                        className
                    )}
                >
                    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                        <div>
                            <RadixDialog.Title className="text-lg font-semibold text-foreground">
                                {title}
                            </RadixDialog.Title>
                            {description ? (
                                <RadixDialog.Description className="mt-1 text-sm text-muted-foreground">
                                    {description}
                                </RadixDialog.Description>
                            ) : (
                                <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
                            )}
                        </div>
                        <RadixDialog.Close
                            aria-label="Close dialog"
                            className="cursor-pointer rounded-lg p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                            <XMarkIcon aria-hidden="true" className="h-5 w-5" />
                        </RadixDialog.Close>
                    </div>

                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
                        {error && <Alert variant="error">{error}</Alert>}
                        {children}
                    </div>

                    {footer && (
                        <div className="border-t border-border px-5 py-4">{footer}</div>
                    )}
                </RadixDialog.Content>
            </RadixDialog.Portal>
        </RadixDialog.Root>
    );
}
