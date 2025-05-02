"use client";

import React, {useState} from "react";
import {useSession} from "next-auth/react";
import {useBooks} from "@/lib/hooks/useBooks";
import BookList from "@/components/BookList";
import AddBookForm from "@/components/AddBookForm";
import DeleteBookDialog from "@/components/DeleteBookDialog";
import {Button} from "@/components/ui/button";
import {Book} from "@/lib/types";
import {useLoans} from "@/lib/hooks/useLoans";
import EditBookDialog from "@/components/edit-book-dialog";
import BorrowBookDialog from "@/components/borrow-book-dialog";
import { Input } from "@/components/ui/input";

export default function BooksPage() {
    const {data: session} = useSession();
    const isAdmin = session?.user?.salesRole === "admin";

    const {
        books,
        isLoading,
        addBook,
        deleteBook,
        editBook,
    } = useBooks();
    const {borrowBook} = useLoans(books);
    const [addBookOpen, setAddBookOpen] = useState(false);
    const [editBookDialogOpen, setEditBookDialogOpen] = useState(false);
    const [borrowBookDialogOpen, setBorrowBookDialogOpen] = useState(false);
    const [deleteBookDialogOpen, setDeleteBookDialogOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const handleBorrow = async (bookId: string) => {
        setSelectedBook(books.find((book) => book._id === bookId) as Book);
        setBorrowBookDialogOpen(true);
    };

    const handleEdit = async (book: Book) => {
        setSelectedBook(book);
        setEditBookDialogOpen(true);
    };

    const handleDeleteClick = (book: Book) => {
        setSelectedBook(book);
        setDeleteBookDialogOpen(true);
    };

    const handleDelete = async (bookId: string) => {
        await deleteBook(bookId);
        setDeleteBookDialogOpen(false);
    };

    const handleFilterBooks = (search: string) => {
        setSearchQuery(search.toLowerCase());
    };

    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchQuery) ||
        book.author?.toLowerCase().includes(searchQuery) ||
        book.genre?.toLowerCase().includes(searchQuery)
    );

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                <h1 className="text-2xl font-bold">Books</h1>
                <Input
                    type="text"
                    placeholder="Search by title or author"
                    onChange={(e) => handleFilterBooks(e.target.value)}
                    className="w-full max-w-xs"
                />
                {isAdmin && (
                    <Button className="w-full max-w-40" onClick={() => setAddBookOpen(true)}>
                        Add New Book
                    </Button>
                )}
            </div>
            {isLoading ? (
                <p>Loading books...</p>
            ) : (
                <BookList
                    books={filteredBooks}
                    isAdmin={isAdmin}
                    onBorrow={handleBorrow}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    userLoggedIn={!!session?.user}
                />
            )}

            {/* Dialoge */}
            <AddBookForm
                open={addBookOpen}
                onOpenChange={setAddBookOpen}
                onSubmit={async (data) => {
                    await addBook(data);
                    setAddBookOpen(false);
                }}
            />
            <EditBookDialog
                open={editBookDialogOpen}
                onOpenChange={setEditBookDialogOpen}
                onSubmit={async (data) => {
                    await editBook({ id: selectedBook?._id!, data });
                    setEditBookDialogOpen(false);
                }}
                book={selectedBook}
            />
            <BorrowBookDialog
                open={borrowBookDialogOpen}
                onOpenChange={setBorrowBookDialogOpen}
                book={selectedBook}
                onSubmit={async (bookId, returnDate) => {
                    await borrowBook(bookId, returnDate);
                    setBorrowBookDialogOpen(false);
                }}
            />
            <DeleteBookDialog
                book={selectedBook}
                open={deleteBookDialogOpen}
                onOpenChange={setDeleteBookDialogOpen}
                onDelete={handleDelete}
            />
        </div>
    );
}
