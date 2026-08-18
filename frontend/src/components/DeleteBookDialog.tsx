import React from 'react';

import { Book } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { DialogShell } from "@/components/ui/dialog";

type DeleteBookDialogProps = {
    error?: string | null
  book: Book | null;
  onDelete: (bookId: string) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting?: boolean;
};

const DeleteBookDialog: React.FC<DeleteBookDialogProps> = ({
  book,
  onDelete,
  open,
  onOpenChange,
  isDeleting = false,
  error,
}) => {
  const handleDelete = async () => {
    if (book) {
      await onDelete(book._id);
    }
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Delete book"
            error={error}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete book"}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-foreground">{book?.title}</span>? This action cannot be
        undone.
      </p>
    </DialogShell>
  );
};

export default DeleteBookDialog;
