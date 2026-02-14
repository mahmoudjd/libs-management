import React, { useState, useEffect } from 'react';
import { Book, BookFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Dialog from "@radix-ui/react-dialog";

interface EditBookDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: BookFormData) => Promise<void>;
    book: Book | null;
    isSubmitting?: boolean;
}

const EditBookDialog: React.FC<EditBookDialogProps> = ({ open, onOpenChange, onSubmit, book, isSubmitting = false }) => {
    const [title, setTitle] = useState(book?.title || '');
    const [author, setAuthor] = useState(book?.author || '');
    const [genre, setGenre] = useState(book?.genre || '');
    const [available, setAvailable] = useState(book?.available || false);

    // useEffect, um den State zu aktualisieren, wenn book sich ändert
    useEffect(() => {
        if (book) {
            setTitle(book.title);
            setAuthor(book.author);
            setGenre(book.genre);
            setAvailable(book.available);
        }
    }, [book]);

    const handleSubmit = async () => {
        if (book) {
            await onSubmit({
                ...book,
                title,
                author,
                genre,
                available
            });
            onOpenChange(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content
                    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
                >
                    <Dialog.Title className="text-lg font-semibold mb-4">Edit Book</Dialog.Title>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" htmlFor="title">Book Title</label>
                        <Input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter book title"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" htmlFor="author">Author</label>
                        <Input
                            id="author"
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="Enter author's name"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2" htmlFor="genre">Genre</label>
                        <Input
                            id="genre"
                            type="text"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            placeholder="Enter genre"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <input
                            id="available"
                            type="checkbox"
                            checked={available}
                            onChange={(e) => setAvailable(e.target.checked)}
                            className="mr-2 rounded-md border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        />
                        <label htmlFor="available" className="text-sm font-medium">Available for Borrowing</label>
                    </div>

                    <div className="flex justify-between gap-4">
                        <Button
                            onClick={handleSubmit}
                            className="w-full bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none py-3 rounded-md"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full py-3 rounded-md text-gray-700"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default EditBookDialog;
