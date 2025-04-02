import { ObjectId } from "mongodb";
import { Response } from "express";
import type { AppContext } from "../context/app-ctx";

/**
 * Delete a book by ID
 * @param appCtx
 */
export const deleteBookHandler = (appCtx: AppContext) => async (req: any, res: Response) => {
  const { bookId } = req.params;

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Only admins can delete books" });
  }

  if (!ObjectId.isValid(bookId)) {
    return res.status(400).json({ error: "Invalid book ID" });
  }

  try {
    const result = await appCtx.dbCtx.books.findOneAndDelete({ _id: new ObjectId(bookId) });

    if (!result) {
      return res.status(404).json({ error: "Book not found" });
    }

    return res.status(204).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(`⚠ Books: ${error}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
