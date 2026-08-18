import React, { useEffect, useMemo, useState } from "react"

import { Book, BookFormData } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogShell } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"

interface EditBookDialogProps {
    error?: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: BookFormData) => Promise<void>
    book: Book | null
    isSubmitting?: boolean
}

const EditBookDialog: React.FC<EditBookDialogProps> = ({ open, onOpenChange, onSubmit, book, isSubmitting = false, error }) => {
    const [title, setTitle] = useState(book?.title || "")
    const [author, setAuthor] = useState(book?.author || "")
    const [genre, setGenre] = useState(book?.genre || "")
    const [totalCopies, setTotalCopies] = useState<number>(book?.totalCopies || 1)
    const [availableCopies, setAvailableCopies] = useState<number>(book?.availableCopies || 0)

    const estimatedActiveLoans = useMemo(() => {
        if (!book) {
            return 0
        }
        return Math.max(0, book.totalCopies - book.availableCopies)
    }, [book])

    const minTotalCopies = useMemo(() => {
        return Math.max(1, estimatedActiveLoans)
    }, [estimatedActiveLoans])

    const maxAvailableCopies = useMemo(() => {
        return Math.max(0, totalCopies - estimatedActiveLoans)
    }, [estimatedActiveLoans, totalCopies])

    useEffect(() => {
        if (book) {
            setTitle(book.title)
            setAuthor(book.author)
            setGenre(book.genre)
            setTotalCopies(book.totalCopies)
            setAvailableCopies(book.availableCopies)
        }
    }, [book])

    useEffect(() => {
        if (availableCopies > maxAvailableCopies) {
            setAvailableCopies(maxAvailableCopies)
        }
    }, [availableCopies, maxAvailableCopies])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (book) {
            await onSubmit({
                title,
                author,
                genre,
                totalCopies,
                availableCopies,
            })
        }
    }

    return (
        <DialogShell
            open={open}
            onOpenChange={onOpenChange}
            title="Edit book"
            error={error}
            description={book ? `Update the details for "${book.title}".` : undefined}
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" form="edit-book-form" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            }
        >
            <form id="edit-book-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <Field label="Book title" htmlFor="edit-book-title">
                    <Input
                        id="edit-book-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter book title"
                        required
                        disabled={isSubmitting}
                    />
                </Field>

                <Field label="Author" htmlFor="edit-book-author">
                    <Input
                        id="edit-book-author"
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Enter author's name"
                        required
                        disabled={isSubmitting}
                    />
                </Field>

                <Field label="Genre" htmlFor="edit-book-genre">
                    <Input
                        id="edit-book-genre"
                        type="text"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        placeholder="Enter genre"
                        required
                        disabled={isSubmitting}
                    />
                </Field>

                <Field
                    label="Total copies"
                    htmlFor="edit-book-total-copies"
                    hint={
                        estimatedActiveLoans > 0
                            ? `${estimatedActiveLoans} active loan(s) require at least ${minTotalCopies} total copies.`
                            : undefined
                    }
                >
                    <Input
                        id="edit-book-total-copies"
                        type="number"
                        min={minTotalCopies}
                        value={totalCopies}
                        onChange={(e) => {
                            const parsed = Number.parseInt(e.target.value, 10)
                            const safeValue = Number.isFinite(parsed) && !Number.isNaN(parsed)
                                ? Math.max(parsed, minTotalCopies)
                                : minTotalCopies
                            setTotalCopies(safeValue)
                        }}
                        disabled={isSubmitting}
                    />
                </Field>

                <Field
                    label="Available copies"
                    htmlFor="edit-book-available-copies"
                    hint={`Max available with current active loans: ${maxAvailableCopies}`}
                >
                    <Input
                        id="edit-book-available-copies"
                        type="number"
                        min={0}
                        max={maxAvailableCopies}
                        value={availableCopies}
                        onChange={(e) => {
                            const parsed = Number.parseInt(e.target.value, 10)
                            const safeValue = Number.isFinite(parsed) && !Number.isNaN(parsed)
                                ? Math.max(0, Math.min(parsed, maxAvailableCopies))
                                : 0
                            setAvailableCopies(safeValue)
                        }}
                        disabled={isSubmitting}
                    />
                </Field>
            </form>
        </DialogShell>
    )
}

export default EditBookDialog
