import React from "react"
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"

import { Book } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type BookCardProps = {
    book: Book
    isStaff: boolean
    onBorrow: (bookId: string) => void
    onEdit: (book: Book) => void
    onDelete: (book: Book) => void
    onReserve: (bookId: string) => void
    userLoggedIn: boolean
    isBorrowing?: boolean
    isEditing?: boolean
    isDeleting?: boolean
    isReserving?: boolean
    pendingReservationId?: string
}

const BookCard: React.FC<BookCardProps> = ({
    book,
    isStaff,
    onBorrow,
    onEdit,
    onDelete,
    onReserve,
    userLoggedIn,
    isBorrowing = false,
    isEditing = false,
    isDeleting = false,
    isReserving = false,
    pendingReservationId,
}) => {
    const stockRatio = book.totalCopies > 0 ? book.availableCopies / book.totalCopies : 0

    return (
        <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
            <CardContent className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold leading-snug text-foreground">
                            {book.title}
                        </h3>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    <Badge variant={book.available ? "success" : "destructive"}>
                        {book.available ? "Available" : "Borrowed"}
                    </Badge>
                </div>

                <div>
                    <Badge variant="secondary">{book.genre}</Badge>
                </div>

                <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Copies in stock</span>
                        <span className="font-semibold text-foreground">
                            {book.availableCopies}/{book.totalCopies}
                        </span>
                    </div>
                    <div
                        className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
                        role="progressbar"
                        aria-label={`${book.availableCopies} of ${book.totalCopies} copies available`}
                        aria-valuenow={book.availableCopies}
                        aria-valuemin={0}
                        aria-valuemax={book.totalCopies}
                    >
                        <div
                            className="h-full rounded-full bg-success"
                            style={{ width: stockRatio > 0 ? `${Math.max(stockRatio * 100, 6)}%` : "0%" }}
                        />
                    </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
                    {isStaff && (
                        <>
                            <Button
                                variant="subtle"
                                size="icon"
                                aria-label={`Edit ${book.title}`}
                                title="Edit book"
                                onClick={() => onEdit(book)}
                                disabled={isEditing || isDeleting}
                            >
                                <PencilIcon aria-hidden="true" className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="destructive"
                                size="icon"
                                aria-label={`Delete ${book.title}`}
                                title="Delete book"
                                onClick={() => onDelete(book)}
                                disabled={isDeleting || isEditing}
                            >
                                <TrashIcon aria-hidden="true" className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {book.available && userLoggedIn && (
                        <Button
                            size="sm"
                            onClick={() => onBorrow(book._id)}
                            disabled={isBorrowing}
                        >
                            {isBorrowing ? "Borrowing..." : "Borrow"}
                        </Button>
                    )}

                    {!book.available && userLoggedIn && !isStaff && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReserve(book._id)}
                            disabled={Boolean(pendingReservationId) || isReserving}
                        >
                            {pendingReservationId ? "Reserved" : isReserving ? "Reserving..." : "Reserve"}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default BookCard
