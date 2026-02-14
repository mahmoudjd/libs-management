import React, {useState} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {BookFormData} from '@/lib/types';
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

type AddBookFormProps = {
    onSubmit: (bookData: BookFormData) => Promise<void>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isSubmitting?: boolean;
};

const AddBookForm: React.FC<AddBookFormProps> = ({onSubmit, open, onOpenChange, isSubmitting = false}) => {
    const [bookData, setBookData] = useState<BookFormData>({
        title: '',
        author: '',
        genre: '',
        available: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setBookData((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(bookData);
        setBookData({
            title: '',
            author: '',
            genre: '',
            available: true,
        });
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50"/>
                <Dialog.Content
                    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <Dialog.Title className="text-lg font-semibold mb-4">Add New Book</Dialog.Title>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <Input
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
                                <Input
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
                                <Input
                                    type="text"
                                    name="genre"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={bookData.genre}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between space-x-2">
                            <Button
                                variant="default"
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Save Book"}
                            </Button>
                            <Dialog.Close asChild>
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </Dialog.Close>

                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default AddBookForm;
