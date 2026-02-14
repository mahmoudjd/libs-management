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
    return (
        <Card className="flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col justify-between h-full">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{book.title}</h3>
                    <p className="text-gray-600 text-sm">Author: {book.author}</p>
                    <p className="text-gray-600 text-sm">Genre: {book.genre}</p>
                    <p className="text-gray-600 text-sm mb-4">Stock: {book.availableCopies}/{book.totalCopies}</p>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 justify-between items-center mt-auto">
                    <Badge variant={book.available ? "success" : "destructive"}>
                        {book.available ? "Available" : "Borrowed"}
                    </Badge>

                    <div className="flex space-x-2">
                        {isStaff && (
                            <>
                                <Button
                                    variant="outline"
                                    className="w-9 h-9 p-0 rounded-full bg-yellow-100 hover:bg-yellow-200 border-none"
                                    title="Edit Book"
                                    onClick={() => onEdit(book)}
                                    disabled={isEditing || isDeleting}
                                >
                                    <PencilIcon className="h-5 w-5 text-yellow-700" />
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-9 h-9 p-0 rounded-full bg-red-100 hover:bg-red-200 border-none"
                                    title="Delete Book"
                                    onClick={() => onDelete(book)}
                                    disabled={isDeleting || isEditing}
                                >
                                    <TrashIcon className="h-5 w-5 text-red-700" />
                                </Button>
                            </>
                        )}

                        {book.available && userLoggedIn && (
                            <Button
                                variant="default"
                                className="text-xs font-semibold rounded-full"
                                onClick={() => onBorrow(book._id)}
                                disabled={isBorrowing}
                            >
                                {isBorrowing ? "Borrowing..." : "Borrow"}
                            </Button>
                        )}

                        {!book.available && userLoggedIn && !isStaff && (
                            <Button
                                variant="outline"
                                className="text-xs font-semibold rounded-full"
                                onClick={() => onReserve(book._id)}
                                disabled={Boolean(pendingReservationId) || isReserving}
                            >
                                {pendingReservationId ? "Reserved" : (isReserving ? "Reserving..." : "Reserve")}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default BookCard
