"use client"

import React, { useDeferredValue, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { ArrowsUpDownIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline"

import AddBookForm from "@/components/AddBookForm"
import BookList from "@/components/BookList"
import BorrowBookDialog from "@/components/borrow-book-dialog"
import DeleteBookDialog from "@/components/DeleteBookDialog"
import EditBookDialog from "@/components/edit-book-dialog"
import { PageLayout } from "@/components/page-layout"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Select } from "@/components/ui/select"
import { SkeletonCards } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/lib/api-error"
import { useBooks } from "@/lib/hooks/useBooks"
import { useGenres } from "@/lib/hooks/useGenres"
import { useLoans } from "@/lib/hooks/useLoans"
import { useReservations } from "@/lib/hooks/useReservations"
import type { Book } from "@/lib/types"

type BookSortBy = "createdAt" | "title" | "author" | "genre" | "availableCopies"

// Newest-first reads right for dates; A-Z for everything else. The toggle still wins.
const DEFAULT_SORT_ORDER: Record<BookSortBy, "asc" | "desc"> = {
  createdAt: "desc",
  title: "asc",
  author: "asc",
  genre: "asc",
  availableCopies: "desc",
}

const PAGE_SIZE = 12

export default function BooksPage() {
  const { data: session } = useSession()
  const role = session?.user?.salesRole
  const isStaff = role === "admin" || role === "librarian"

  const [searchQuery, setSearchQuery] = useState("")
  const [genreFilter, setGenreFilter] = useState("")
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState<BookSortBy>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const deferredGenreFilter = useDeferredValue(genreFilter)

  const {
    books,
    pagination,
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
    q: deferredSearchQuery,
    genre: deferredGenreFilter,
    availableOnly,
    paginated: true,
    page,
    pageSize: PAGE_SIZE,
    sortBy,
    order: sortOrder,
  })

  // Only the borrow mutation is needed here, so the loan list stays unfetched.
  const { borrowBook, isBorrowingBook, borrowingBookId } = useLoans({ enabled: false })
  const { genres } = useGenres()

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
  const [dialogError, setDialogError] = useState<string | null>(null)

  useEffect(() => {
    setPage(1)
  }, [deferredSearchQuery, deferredGenreFilter, availableOnly, sortBy, sortOrder])

  const hasActiveFilters =
    searchQuery !== "" || genreFilter !== "" || availableOnly || sortBy !== "createdAt" || sortOrder !== DEFAULT_SORT_ORDER[sortBy]

  const clearFilters = () => {
    setSearchQuery("")
    setGenreFilter("")
    setAvailableOnly(false)
    setSortBy("createdAt")
    setSortOrder("desc")
  }

  const pendingReservations = useMemo(
    () => myReservations.filter((reservation) => reservation.status === "pending"),
    [myReservations]
  )
  const pendingReservationsCount = useMemo(
    () => allReservations.filter((reservation) => reservation.status === "pending").length,
    [allReservations]
  )
  const showReservationSummary = isStaff || Boolean(session?.user)

  const handleBorrow = async (bookId: string) => {
    const book = books.find((item) => item._id === bookId)
    if (!book) {
      return
    }

    setDialogError(null)
    setSelectedBook(book)
    setBorrowBookDialogOpen(true)
  }

  const handleEdit = async (book: Book) => {
    setDialogError(null)
    setSelectedBook(book)
    setEditBookDialogOpen(true)
  }

  const handleDeleteClick = (book: Book) => {
    setDialogError(null)
    setSelectedBook(book)
    setDeleteBookDialogOpen(true)
  }

  const handleDelete = async (bookId: string) => {
    try {
      setDialogError(null)
      await deleteBook(bookId)
      setDeleteBookDialogOpen(false)
    } catch (error) {
      setDialogError(getApiErrorMessage(error, "Failed to delete book"))
    }
  }

  const handleReserve = async (bookId: string) => {
    try {
      setBookActionError(null)
      await reserveBook(bookId)
    } catch (error) {
      setBookActionError(getApiErrorMessage(error, "Failed to reserve book"))
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      setBookActionError(null)
      setCancellingReservationId(reservationId)
      await cancelReservation(reservationId)
    } catch (error) {
      setBookActionError(getApiErrorMessage(error, "Failed to cancel reservation"))
    } finally {
      setCancellingReservationId(null)
    }
  }

  return (
    <PageLayout
      title="Books"
      description="Search the catalogue, borrow available titles and reserve the ones that are out."
      actions={
        isStaff && (
          <Button
            onClick={() => {
              setDialogError(null)
              setAddBookOpen(true)
            }}
          >
            <PlusIcon aria-hidden="true" className="h-4 w-4" />
            Add new book
          </Button>
        )
      }
    >
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="book-search" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="book-search"
                  type="search"
                  className="pl-9"
                  placeholder="Title, author or genre"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="book-genre" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Genre
              </label>
              <Select
                id="book-genre"
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
              >
                <option value="">All genres</option>
                {genres.map((entry) => (
                  <option key={entry.genre} value={entry.genre}>
                    {entry.genre} ({entry.count})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor="book-sort" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Sort by
              </label>
              <div className="flex gap-2">
                <Select
                  id="book-sort"
                  className="flex-1"
                  value={sortBy}
                  onChange={(e) => {
                    const nextSortBy = e.target.value as BookSortBy
                    setSortBy(nextSortBy)
                    setSortOrder(DEFAULT_SORT_ORDER[nextSortBy])
                  }}
                >
                  <option value="createdAt">Date added</option>
                  <option value="title">Title</option>
                  <option value="author">Author</option>
                  <option value="genre">Genre</option>
                  <option value="availableCopies">Available copies</option>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label={sortOrder === "asc" ? "Sort descending" : "Sort ascending"}
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                  onClick={() => setSortOrder((current) => (current === "asc" ? "desc" : "asc"))}
                >
                  <ArrowsUpDownIcon aria-hidden="true" className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-end">
              <label className="inline-flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                />
                Available only
              </label>
            </div>
          </div>

          {(showReservationSummary || hasActiveFilters) && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {showReservationSummary && (
                  <>
                    <span>{isStaff ? "Pending reservations:" : "My pending reservations:"}</span>
                    <Badge
                      variant={
                        (isStaff ? pendingReservationsCount : pendingReservations.length) > 0
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {isStaff ? pendingReservationsCount : pendingReservations.length}
                    </Badge>
                  </>
                )}
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {bookActionError && (
        <Alert variant="error" className="mb-6">
          {bookActionError}
        </Alert>
      )}

      {isLoading ? (
        <SkeletonCards count={6} />
      ) : (
        <>
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
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              shownCount={books.length}
              itemLabel="books"
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {!isStaff && pendingReservations.length > 0 && (
        <Card className="mt-8">
          <CardContent>
            <h2 className="mb-3 text-lg font-semibold text-foreground">My reservations</h2>
            <ul className="space-y-2">
              {pendingReservations.map((reservation) => {
                const isCancelling = isCancellingReservation && cancellingReservationId === reservation._id

                return (
                  <li
                    key={reservation._id}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {reservation.book?.title ?? reservation.bookId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reserved at {new Date(reservation.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelReservation(reservation._id)}
                      disabled={isCancelling}
                    >
                      {isCancelling ? "Cancelling..." : "Cancel"}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <AddBookForm
        open={addBookOpen}
        onOpenChange={setAddBookOpen}
        isSubmitting={isAddingBook}
        error={dialogError}
        onSubmit={async (data) => {
          try {
            setDialogError(null)
            await addBook(data)
            setAddBookOpen(false)
          } catch (error) {
            setDialogError(getApiErrorMessage(error, "Failed to create book"))
          }
        }}
      />

      <EditBookDialog
        open={editBookDialogOpen}
        onOpenChange={setEditBookDialogOpen}
        error={dialogError}
        onSubmit={async (data) => {
          if (!selectedBook) {
            return
          }
          try {
            setDialogError(null)
            await editBook({ id: selectedBook._id, data })
            setEditBookDialogOpen(false)
          } catch (error) {
            setDialogError(getApiErrorMessage(error, "Failed to update book"))
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
        error={dialogError}
        onSubmit={async (bookId, returnDate) => {
          try {
            setDialogError(null)
            await borrowBook(bookId, returnDate)
            setBorrowBookDialogOpen(false)
          } catch (error) {
            setDialogError(getApiErrorMessage(error, "Failed to borrow book"))
          }
        }}
      />

      <DeleteBookDialog
        book={selectedBook}
        open={deleteBookDialogOpen}
        onOpenChange={setDeleteBookDialogOpen}
        onDelete={handleDelete}
        error={dialogError}
        isDeleting={isDeletingBook}
      />
    </PageLayout>
  )
}
