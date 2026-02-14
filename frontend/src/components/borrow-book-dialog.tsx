import React, { useState } from 'react';
import { Book } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as Dialog from "@radix-ui/react-dialog";

interface BorrowBookDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (bookId: string, returnDate: Date) => Promise<void>;
    book: Book | null;
    isSubmitting?: boolean;
}

const BorrowBookDialog: React.FC<BorrowBookDialogProps> = ({ open, onOpenChange, onSubmit, book, isSubmitting = false }) => {
    const [returnDate, setReturnDate] = useState<string>('');  // Store returnDate as string

    const handleSubmit = async () => {
        if (book && returnDate) {
            const returnDateObj = new Date(returnDate); // Convert the returnDate to a Date object
            await onSubmit(book._id, returnDateObj);  // Submit bookId and returnDate
            onOpenChange(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content
                    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    <Dialog.Title className="text-2xl font-semibold mb-6 text-center text-gray-800">Borrow Book</Dialog.Title>

                    {book && (
                        <>
                            <div className="mb-6">
                                <p className="font-medium text-lg text-gray-700 mb-1">Book Information</p>
                                <p className="text-gray-600"><strong>Title:</strong> {book.title}</p>
                                <p className="text-gray-600"><strong>Author:</strong> {book.author}</p>
                                <p className="text-gray-600"><strong>Genre:</strong> {book.genre}</p>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="returnDate" className="block text-sm font-medium text-gray-600 mb-2">Return Date</label>
                                <Input
                                    id="returnDate"
                                    type="date"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    onClick={handleSubmit}
                                    className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none py-3 rounded-lg transition duration-300 ease-in-out"
                                    disabled={isSubmitting || !returnDate}
                                >
                                    {isSubmitting ? "Borrowing..." : "Borrow"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 focus:outline-none py-3 rounded-lg transition duration-300 ease-in-out"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default BorrowBookDialog;
