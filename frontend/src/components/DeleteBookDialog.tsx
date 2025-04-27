import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Book } from '@/lib/types';
import {Text} from "@/components/ui/text";
import {Button} from "@/components/ui/button";

type DeleteBookDialogProps = {
  book: Book | null;
  onDelete: (bookId: string) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DeleteBookDialog: React.FC<DeleteBookDialogProps> = ({
  book,
  onDelete,
  open,
  onOpenChange,
}) => {
  const handleDelete = async () => {
    if (book) {
      await onDelete(book._id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold mb-4">Delete Book</Dialog.Title>
          <Text className="mb-4">
            Are you sure you want to delete "{book?.title}"? This action cannot be undone.
          </Text>
          <div className="flex justify-end">
            <Button
                variant="outline"
              type="button"
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DeleteBookDialog;
