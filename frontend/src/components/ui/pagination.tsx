import { Button } from "@/components/ui/button";

type PaginationProps = {
    page: number;
    totalPages: number;
    total: number;
    shownCount: number;
    itemLabel: string;
    onPageChange: (page: number) => void;
};

export function Pagination({
    page,
    totalPages,
    total,
    shownCount,
    itemLabel,
    onPageChange,
}: PaginationProps) {
    return (
        <nav
            aria-label={`${itemLabel} pagination`}
            className="mt-8 flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row"
        >
            <p className="text-sm text-muted-foreground" aria-live="polite">
                Showing {shownCount} of {total} {itemLabel} · Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </Button>
            </div>
        </nav>
    );
}
