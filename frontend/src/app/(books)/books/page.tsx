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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Books</h1>
                {isAdmin && (
                    <Button onClick={() => setAddBookOpen(true)}>Add New Book</Button>
                )}
            </div>

            {isLoading ? (
                <p>Loading books...</p>
            ) : (
                <BookList
                    books={books}
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
                    await editBook({id: selectedBook?._id!, data});
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
                }}/>

            <DeleteBookDialog
                book={selectedBook}
                open={deleteBookDialogOpen}
                onOpenChange={setDeleteBookDialogOpen}
                onDelete={handleDelete}
            />
        </div>
    );
}
