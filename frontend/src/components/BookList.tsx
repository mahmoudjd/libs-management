import React from 'react';
import BookCard from './BookCard';
import { Book } from '@/lib/types';

type BookListProps = {
  books: Book[];
  isAdmin: boolean;
  onBorrow: (bookId: string) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  userLoggedIn: boolean;
};

const BookList: React.FC<BookListProps> = ({
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
};

export default BookList;
