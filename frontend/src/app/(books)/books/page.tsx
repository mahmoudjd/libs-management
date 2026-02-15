"use client"

import React, { useMemo, useState } from "react"
import { useSession } from "next-auth/react"

import AddBookForm from "@/components/AddBookForm"
import BookList from "@/components/BookList"
import BorrowBookDialog from "@/components/borrow-book-dialog"
import DeleteBookDialog from "@/components/DeleteBookDialog"
import EditBookDialog from "@/components/edit-book-dialog"
import { PageLayout } from "@/components/page-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/lib/api-error"
import { useBooks } from "@/lib/hooks/useBooks"
import { useLoans } from "@/lib/hooks/useLoans"
import { useReservations } from "@/lib/hooks/useReservations"
import type { Book } from "@/lib/types"

type BookSortBy = "createdAt" | "title" | "author" | "genre" | "availableCopies"

export default function BooksPage() {
  const { data: session } = useSession()
  const role = session?.user?.salesRole
  const isStaff = role === "admin" || role === "librarian"

  const [searchQuery, setSearchQuery] = useState("")
  const [genreFilter, setGenreFilter] = useState("")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState<BookSortBy>("createdAt")

  const {
    books,
    isLoading,
    addBook,
    deleteBook,
    editBook,
    isAddingBook,
    isDeletingBook,
    deletingBookId,
    isEditingBook,
    editingBookId,
  } = useBooks({
    q: searchQuery,
    genre: genreFilter,
    availableOnly,
    sortBy,
    order: sortBy === "createdAt" ? "desc" : "asc",
  })

  const { borrowBook, isBorrowingBook, borrowingBookId } = useLoans(books)

  const {
    myReservations,
    allReservations,
    reserveBook,
    cancelReservation,
    reservingBookId,
    pendingReservationByBookId,
    isCancellingReservation,
  } = useReservations()

  const [addBookOpen, setAddBookOpen] = useState(false)
  const [editBookDialogOpen, setEditBookDialogOpen] = useState(false)
  const [borrowBookDialogOpen, setBorrowBookDialogOpen] = useState(false)
  const [deleteBookDialogOpen, setDeleteBookDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [cancellingReservationId, setCancellingReservationId] = useState<string | null>(null)
  const [bookActionError, setBookActionError] = useState<string | null>(null)

  const pendingReservations = useMemo(
    () => myReservations.filter((reservation) => reservation.status === "pending"),
    [myReservations]
  )
  const pendingReservationsCount = useMemo(
    () => allReservations.filter((reservation) => reservation.status === "pending").length,
    [allReservations]
  )

  const handleBorrow = async (bookId: string) => {
    const book = books.find((item) => item._id === bookId)
    if (!book) {
      return
    }

    setSelectedBook(book)
    setBorrowBookDialogOpen(true)
  }

  const handleEdit = async (book: Book) => {
    setSelectedBook(book)
    setEditBookDialogOpen(true)
  }

  const handleDeleteClick = (book: Book) => {
    setSelectedBook(book)
    setDeleteBookDialogOpen(true)
  }

  const handleDelete = async (bookId: string) => {
    try {
      setBookActionError(null)
      await deleteBook(bookId)
      setDeleteBookDialogOpen(false)
    } catch (error) {
      setBookActionError(getApiErrorMessage(error, "Failed to delete book"))
    }
  }

  const handleReserve = async (bookId: string) => {
    await reserveBook(bookId)
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      setCancellingReservationId(reservationId)
      await cancelReservation(reservationId)
    } finally {
      setCancellingReservationId(null)
    }
  }

  return (
    <PageLayout title="Books">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <Input
              type="text"
              placeholder="Search title, author or genre"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Filter by genre"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as BookSortBy)}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm"
            >
              <option value="createdAt">Newest</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="genre">Genre</option>
              <option value="availableCopies">Available Copies</option>
            </select>
            <label className="inline-flex items-center gap-2 px-3 h-10 rounded-md border border-gray-300 text-sm">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
              />
              Available only
            </label>
          </div>
          {isStaff && (
            <Button className="min-w-40" onClick={() => setAddBookOpen(true)}>
              Add New Book
            </Button>
          )}
        </div>

        {isStaff ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Pending reservations:</span>
            <Badge variant={pendingReservationsCount > 0 ? "warning" : "secondary"}>
              {pendingReservationsCount}
            </Badge>
          </div>
        ) : (
          session?.user && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>My pending reservations:</span>
              <Badge variant={pendingReservations.length > 0 ? "warning" : "secondary"}>
                {pendingReservations.length}
              </Badge>
            </div>
          )
        )}
      </div>

      {isLoading ? (
        <p>Loading books...</p>
      ) : (
        <BookList
          books={books}
          isStaff={isStaff}
          onBorrow={handleBorrow}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onReserve={handleReserve}
          userLoggedIn={Boolean(session?.user)}
          borrowingBookId={borrowingBookId}
          deletingBookId={deletingBookId}
          editingBookId={editingBookId}
          reservingBookId={reservingBookId}
          pendingReservationByBookId={pendingReservationByBookId}
        />
      )}

      {bookActionError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {bookActionError}
        </div>
      )}

      {!isStaff && pendingReservations.length > 0 && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">My Reservations</h2>
          <ul className="space-y-2">
            {pendingReservations.map((reservation) => (
              <li
                key={reservation._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border border-gray-100 p-3"
              >
                <div>
                  <p className="font-medium">{reservation.book?.title ?? reservation.bookId}</p>
                  <p className="text-xs text-gray-500">
                    reserved at {new Date(reservation.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleCancelReservation(reservation._id)}
                  disabled={isCancellingReservation && cancellingReservationId === reservation._id}
                >
                  {isCancellingReservation && cancellingReservationId === reservation._id ? "Cancelling..." : "Cancel"}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AddBookForm
        open={addBookOpen}
        onOpenChange={setAddBookOpen}
        isSubmitting={isAddingBook}
        onSubmit={async (data) => {
          try {
            setBookActionError(null)
            await addBook(data)
            setAddBookOpen(false)
          } catch (error) {
            setBookActionError(getApiErrorMessage(error, "Failed to create book"))
            throw error
          }
        }}
      />

      <EditBookDialog
        open={editBookDialogOpen}
        onOpenChange={setEditBookDialogOpen}
        onSubmit={async (data) => {
          if (!selectedBook) {
            return
          }
          try {
            setBookActionError(null)
            await editBook({ id: selectedBook._id, data })
            setEditBookDialogOpen(false)
          } catch (error) {
            setBookActionError(getApiErrorMessage(error, "Failed to update book"))
            throw error
          }
        }}
        book={selectedBook}
        isSubmitting={isEditingBook}
      />

      <BorrowBookDialog
        open={borrowBookDialogOpen}
        onOpenChange={setBorrowBookDialogOpen}
        book={selectedBook}
        isSubmitting={isBorrowingBook}
        onSubmit={async (bookId, returnDate) => {
          await borrowBook(bookId, returnDate)
        }}
      />

      <DeleteBookDialog
        book={selectedBook}
        open={deleteBookDialogOpen}
        onOpenChange={setDeleteBookDialogOpen}
        onDelete={handleDelete}
        isDeleting={isDeletingBook}
      />
    </PageLayout>
  )
}
