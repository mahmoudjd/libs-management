import { Request, Response } from "express";
import { AppContext } from "../context/app-ctx";
import { ObjectId } from "mongodb";

export const updateLoandHandler = (appCtx: AppContext) => async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const { returnDate } = req.body;

  if (!loanId) {
    return res.status(400).json({ error: "Missing loan ID" });
  }

  try {
    const loan = await updateLoan(appCtx, loanId, returnDate);
    if (!loan) {
      return res.status(400).json({ error: "Loan update failed" });
    }
    return res.status(200).json({ message: "Loan updated successfully" });
  } catch (error) {
    console.error("Error updating loan:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const updateLoan = async (appCtx: AppContext, loanId: string, returnDate: string) => {
  const cursor = await appCtx.dbCtx.loans.updateOne({
    _id: new ObjectId(loanId)
  }, {
    $set: {
      returnDate: new Date(returnDate),
    }
  })

  const success = cursor.modifiedCount > 0;

  return success
}
