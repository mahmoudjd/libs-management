import React, { useEffect, useState } from 'react';

import { Book } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogShell } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";

interface BorrowBookDialogProps {
    error?: string | null
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (bookId: string, returnDate: Date) => Promise<void>;
    book: Book | null;
    isSubmitting?: boolean;
}

const DEFAULT_LOAN_DAYS = 14;

// Built from local fields — toISOString() would shift the day in UTC+13/+14.
function toDateInputValue(date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(days: number) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date;
}

const BorrowBookDialog: React.FC<BorrowBookDialogProps> = ({ open, onOpenChange, onSubmit, book, isSubmitting = false, error }) => {
    const minReturnDate = toDateInputValue(addDays(1));
    const [returnDate, setReturnDate] = useState<string>(() => toDateInputValue(addDays(DEFAULT_LOAN_DAYS)));

    // Each new borrow starts from the default loan period again.
    useEffect(() => {
        if (open) {
            setReturnDate(toDateInputValue(addDays(DEFAULT_LOAN_DAYS)));
        }
    }, [open]);

    const isReturnDateValid = returnDate >= minReturnDate;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (book && isReturnDateValid) {
            await onSubmit(book._id, new Date(`${returnDate}T12:00:00`));
        }
    };

    return (
        <DialogShell
            open={open}
            onOpenChange={onOpenChange}
            title="Borrow book"
            error={error}
            description="Pick the date the book has to be back in the library."
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="borrow-book-form"
                        disabled={isSubmitting || !isReturnDateValid}
                    >
                        {isSubmitting ? "Borrowing..." : "Borrow"}
                    </Button>
                </div>
            }
        >
            {book && (
                <form id="borrow-book-form" onSubmit={handleSubmit} className="space-y-4">
                    <dl className="rounded-xl border border-border bg-surface-muted p-4 text-sm">
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Title</dt>
                            <dd className="text-right font-medium text-foreground">{book.title}</dd>
                        </div>
                        <div className="mt-2 flex justify-between gap-4">
                            <dt className="text-muted-foreground">Author</dt>
                            <dd className="text-right text-foreground">{book.author}</dd>
                        </div>
                        <div className="mt-2 flex justify-between gap-4">
                            <dt className="text-muted-foreground">Genre</dt>
                            <dd className="text-right text-foreground">{book.genre}</dd>
                        </div>
                    </dl>

                    <Field
                        label="Return date"
                        htmlFor="borrow-return-date"
                        hint={isReturnDateValid ? undefined : "The return date must be in the future."}
                    >
                        <Input
                            id="borrow-return-date"
                            type="date"
                            min={minReturnDate}
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </Field>
                </form>
            )}
        </DialogShell>
    );
};

export default BorrowBookDialog;
