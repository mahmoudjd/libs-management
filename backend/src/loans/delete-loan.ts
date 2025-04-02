import { Request, Response } from "express";
import { AppContext } from "../context/app-ctx";
import { ObjectId } from "mongodb";

export const deleteLoandHandler = (appCtx: AppContext) => async (req: any, res: Response) => {
  const { loanId } = req.params;

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (!loanId) {
    return res.status(400).json({ error: "Missing loan ID" });
  }

  try {
    const loan = await deleteLoan(appCtx, loanId);
    if (!loan) {
      return res.status(400).json({ error: "Loan delete failed" });
    }
    return res.status(204).json({ message: "Loan deleted successfully" });
  } catch (error) {
    console.error("Error deleting loan:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const deleteLoan = async (appCtx: AppContext, loanId: string) => {
  const deletedLoan = await appCtx.dbCtx.loans.findOneAndDelete({
    _id: new ObjectId(loanId)
  })
  if (!deletedLoan) {
    throw new Error("Loan not found");
  }
  const book = await appCtx.dbCtx.books.updateOne({ _id: deletedLoan?.bookId }, { $set: { available: true } })

  return book && deletedLoan;
}
