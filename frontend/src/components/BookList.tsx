import React from 'react';
import BookCard from './BookCard';
import {Book} from '@/lib/types';
import {GridList} from "@/components/ui/grid-list";

type BookListProps = {
    books: Book[];
    isAdmin: boolean;
    onBorrow: (bookId: string) => void;
    onEdit: (book: Book) => void;
    onDelete: (book: Book) => void;
    userLoggedIn: boolean;
};

export const BookList: React.FC<BookListProps> = ({
                                                      books,
                                                      isAdmin,
                                                      onBorrow,
                                                      onEdit,
                                                      onDelete,
                                                      userLoggedIn,
                                                  }) => {
    if (books.length === 0) {
        return <p className="col-span-3 text-center text-gray-500">No books found matching your search.</p>;
    }

    return (
        <GridList>
            {books.map((book) => (
                <BookCard
                    key={book._id}
                    book={book}
                    isAdmin={isAdmin}
                    onBorrow={onBorrow}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    userLoggedIn={userLoggedIn}
                />
            ))}
        </GridList>
    );
};

export default BookList;
