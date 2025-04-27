import React from 'react';
import {PencilIcon, TrashIcon} from '@heroicons/react/24/outline';
import {Book} from '@/lib/types';
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

type BookCardProps = {
    book: Book;
    isAdmin: boolean;
    onBorrow: (bookId: string) => void;
    onEdit: (book: Book) => void;
    onDelete: (book: Book) => void;
    userLoggedIn: boolean;
};

const BookCard: React.FC<BookCardProps> = ({
                                               book,
                                               isAdmin,
                                               onBorrow,
                                               onEdit,
                                               onDelete,
                                               userLoggedIn,
                                           }) => {
    return (
        <Card className="flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col justify-between h-full">
                {/* Book Info */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{book.title}</h3>
                    <p className="text-gray-600 text-sm">Author: {book.author}</p>
                    <p className="text-gray-600 text-sm mb-4">Genre: {book.genre}</p>
                </div>

                {/* Status + Actions */}
                <div className="flex justify-between items-center mt-auto">
                    {/* Status */}
                    <Badge variant={book.available ? "success" : "destructive"}>
                        {book.available ? 'Available' : 'Borrowed'}
                    </Badge>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        {isAdmin && (
                            <>
                                <Button
                                    variant="outline"
                                    className="w-9 h-9 p-0 rounded-full bg-yellow-100 hover:bg-yellow-200 border-none"
                                    title="Edit Book"
                                    onClick={() => onEdit(book)}
                                >
                                    <PencilIcon className="h-5 w-5 text-yellow-700"/>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-9 h-9 p-0 rounded-full bg-red-100 hover:bg-red-200 border-none"
                                    title="Delete Book"
                                    onClick={() => onDelete(book)}
                                >
                                    <TrashIcon className="h-5 w-5 text-red-700"/>
                                </Button>
                            </>
                        )}

                        {book.available && userLoggedIn && (
                            <Button
                                variant="default"
                                className="text-xs font-semibold rounded-full"
                                onClick={() => onBorrow(book._id)}
                            >
                                Borrow
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BookCard;
