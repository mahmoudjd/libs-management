import { Request, Response } from "express";
import type { AppContext } from "../context/app-ctx";
import { ObjectId } from "mongodb";
import { LoanSchema } from "../types/types";

export const createLoanHandler = (appCtx: AppContext) => async (req: Request, res: Response) => {
  const { bookId, userId, returnDate } = req.body;

  if (!bookId || !userId || !returnDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const loan = await createLoan(appCtx, bookId, userId, returnDate, req);
    if (!loan) {
      return res.status(400).json({ error: "Loan creation failed" });
    }
    return res.status(201).json(loan);
  } catch (error) {
    console.error("Error creating loan:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

async function createLoan(appCtx: AppContext, bookId: string, userId: string, returnDate: string, req: Request) {
  const book = await appCtx.dbCtx.books.findOne({ _id: new ObjectId(bookId) });

  if (!book) {
    console.debug(`Book with ID ${bookId} not found`);
    return null;
  }

  if (!book.available) {
    console.debug(`Book with ID ${bookId} is already loaned out`);
    return null;
  }

  // Loan-Daten validieren
  const parseResult = LoanSchema.safeParse({
    bookId: new ObjectId(bookId),
    userId: new ObjectId(userId),
    returnDate: new Date(returnDate),
    loanDate: new Date(),
  });

  if (!parseResult.success) {
    console.debug(
      `Invalid request body for method ${req.method} ${req.originalUrl}: ${parseResult.error.toString()}`
    );
    return null;
  }

  const loan = parseResult.data;

  // Loan in die Datenbank einfügen
  const result = await appCtx.dbCtx.loans.insertOne({
    ...loan,
    _id: new ObjectId(),
  });

  if (!result.insertedId) {
    console.error("Failed to insert loan into the database");
    return null;
  }

  // Buch als nicht verfügbar markieren
  const updateResult = await appCtx.dbCtx.books.updateOne(
    { _id: new ObjectId(bookId) },
    { $set: { available: false } }
  );

  if (updateResult.modifiedCount === 0) {
    console.error(`Failed to update book availability for book ID: ${bookId}`);
    return null;
  }

  return loan;
}
