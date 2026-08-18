import React, { useEffect, useState } from "react"

import { BookFormData } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DialogShell } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"

type AddBookFormProps = {
    error?: string | null
    onSubmit: (bookData: BookFormData) => Promise<void>
    open: boolean
    onOpenChange: (open: boolean) => void
    isSubmitting?: boolean
}

const EMPTY_BOOK_FORM: BookFormData = {
    title: "",
    author: "",
    genre: "",
    totalCopies: 1,
    availableCopies: 1,
}

const AddBookForm: React.FC<AddBookFormProps> = ({ onSubmit, open, onOpenChange, isSubmitting = false, error }) => {
    const [bookData, setBookData] = useState<BookFormData>(EMPTY_BOOK_FORM)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        if (name === "totalCopies") {
            const parsed = Number.parseInt(value, 10)
            const nextTotalCopies = Number.isNaN(parsed) ? undefined : Math.max(parsed, 1)
            setBookData((prev) => ({
                ...prev,
                totalCopies: nextTotalCopies,
                availableCopies:
                    nextTotalCopies === undefined
                        ? prev.availableCopies
                        : Math.min(prev.availableCopies ?? nextTotalCopies, nextTotalCopies),
            }))
            return
        }

        if (name === "availableCopies") {
            const parsed = Number.parseInt(value, 10)
            const nextAvailable = Number.isNaN(parsed)
                ? undefined
                : Math.max(0, Math.min(parsed, bookData.totalCopies ?? parsed))
            setBookData((prev) => ({
                ...prev,
                availableCopies: nextAvailable,
            }))
            return
        }

        setBookData((prev) => ({ ...prev, [name]: value }))
    }

    // Reset on open, so a failed submit keeps what the user typed.
    useEffect(() => {
        if (open) {
            setBookData(EMPTY_BOOK_FORM)
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit(bookData)
    }

    return (
        <DialogShell
            open={open}
            onOpenChange={onOpenChange}
            title="Add new book"
            error={error}
            description="Create a new title and set how many copies the library owns."
            footer={
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" form="add-book-form" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save book"}
                    </Button>
                </div>
            }
        >
            <form id="add-book-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <Field label="Title" htmlFor="add-book-title">
                    <Input
                        id="add-book-title"
                        type="text"
                        name="title"
                        value={bookData.title}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                    />
                </Field>
                <Field label="Author" htmlFor="add-book-author">
                    <Input
                        id="add-book-author"
                        type="text"
                        name="author"
                        value={bookData.author}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                    />
                </Field>
                <Field label="Genre" htmlFor="add-book-genre">
                    <Input
                        id="add-book-genre"
                        type="text"
                        name="genre"
                        value={bookData.genre}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                    />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Total copies" htmlFor="add-book-total-copies">
                        <Input
                            id="add-book-total-copies"
                            type="number"
                            min={1}
                            name="totalCopies"
                            value={bookData.totalCopies ?? ""}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        />
                    </Field>
                    <Field label="Available copies" htmlFor="add-book-available-copies">
                        <Input
                            id="add-book-available-copies"
                            type="number"
                            min={0}
                            max={bookData.totalCopies ?? undefined}
                            name="availableCopies"
                            value={bookData.availableCopies ?? ""}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        />
                    </Field>
                </div>
            </form>
        </DialogShell>
    )
}

export default AddBookForm
