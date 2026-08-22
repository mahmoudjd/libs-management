import React from "react"

import BookCard from "./BookCard"
import type { Book, Reservation } from "@/lib/types"
import { GridList } from "@/components/ui/grid-list"
import { BookOpenIcon } from "@heroicons/react/24/outline"

import { EmptyState } from "@/components/ui/empty-state"

type BookListProps = {
  books: Book[]
  isStaff: boolean
  onBorrow: (bookId: string) => void
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
  onReserve: (bookId: string) => void
  userLoggedIn: boolean
  borrowingBookId?: string
  deletingBookId?: string
  editingBookId?: string
  reservingBookId?: string
  pendingReservationByBookId?: Map<string, Reservation>
}

export const BookList: React.FC<BookListProps> = ({
  books,
  isStaff,
  onBorrow,
  onEdit,
  onDelete,
  onReserve,
  userLoggedIn,
  borrowingBookId,
  deletingBookId,
  editingBookId,
  reservingBookId,
  pendingReservationByBookId,
}) => {
  if (books.length === 0) {
    return (
      <EmptyState
        Icon={BookOpenIcon}
        title="No books found"
        description="Try adjusting your search or filters."
      />
    )
  }

  return (
    <GridList>
      {books.map((book) => (
        <BookCard
          key={book._id}
          book={book}
          isStaff={isStaff}
          onBorrow={onBorrow}
          onEdit={onEdit}
          onDelete={onDelete}
          onReserve={onReserve}
          userLoggedIn={userLoggedIn}
          isBorrowing={borrowingBookId === book._id}
          isDeleting={deletingBookId === book._id}
          isEditing={editingBookId === book._id}
          isReserving={reservingBookId === book._id}
          pendingReservationId={pendingReservationByBookId?.get(book._id)?._id}
        />
      ))}
    </GridList>
  )
}

export default BookList
