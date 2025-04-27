import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Book, BookFormData } from '@/lib/types';

type EditBookFormProps = {
  book: Book | null;
  onSubmit: (bookId: string, bookData: BookFormData) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EditBookForm: React.FC<EditBookFormProps> = ({ book, onSubmit, open, onOpenChange }) => {
  const [bookData, setBookData] = useState<BookFormData>({
    title: '',
    author: '',
    genre: '',
    available: true,
  });

  // Update form data when book changes
  useEffect(() => {
    if (book) {
      setBookData({
        title: book.title,
        author: book.author,
        genre: book.genre,
        available: book.available,
      });
    }
  }, [book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (book) {
      await onSubmit(book._id, bookData);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold mb-4">Edit Book</Dialog.Title>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={bookData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Author</label>
                <input
                  type="text"
                  name="author"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={bookData.author}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Genre</label>
                <input
                  type="text"
                  name="genre"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={bookData.genre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Update Book
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EditBookForm;
