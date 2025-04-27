import {Request, Response} from 'express';
import {AppContext} from "../context/app-ctx";
import {LoanDb} from "../types/types";
import {getUsersFromDB} from "../users/get-users";
import {getBooksFromDb} from "../books/get-books";

interface User {
    _id: string;
    role: string;
}

interface MyRequest extends Request {
    user: User;
}

export const getLoansHandler = (appCtx: AppContext) => async (req: MyRequest, res: Response) => {
        try {
            if (req.user.role !== "admin") {
                return res.status(403).json({message: "Not admin"});
            }

            const loans = await getLoans(appCtx);
            const users = await getUsersFromDB(appCtx);
            const books = await getBooksFromDb(appCtx);
            const loansWithUsersInfo = loans.map((loan) => {
                    const user = users.find(user => user._id.toString() === loan.userId.toString());
                    const book = books.find(book => book._id.toString() === loan.bookId.toString());

                    return {
                        ...loan,
                        book: {
                            title: book?.title,
                            author: book?.author
                        },
                        user: {
                            name: user?.firstName + ' ' + user?.lastName,
                            email: user?.email,
                        }
                    };
                }
            );

            return res.status(200).json(loansWithUsersInfo);
        } catch
            (error) {
            console.error(`⚠ Loans: ${error}`);
            return res.status(500).json({error: 'Internal Server Error'});
        }
    }
;

const getLoans = async (appCtx: AppContext): Promise<LoanDb[]> => {
    const cursor = appCtx.dbCtx.loans.find({});
    const loans = await cursor.toArray();
    return loans;
};