import {AppContext} from "../context/app-ctx";
import {Request, Response} from "express";
import {ObjectId} from "mongodb";

export const changeBookAvailability = (appCtx: AppContext) => async (req: Request, res: Response) => {
    const {bookId} = req.params
    try {
        const success = await updateBookAvailabilityInDB(appCtx, bookId)
        if (!success) {
            return res.status(404).json({error: 'Book not found'})
        }
        return res.status(200).json({message: 'Book updated successfully'})

    } catch (error) {
        console.error(`⚠ Books: ${error}`)
        return res.status(500).json({error: 'Internal Server Error'})
    }
}

/**
 * Update book availability in database
 * @param appCtx
 * @param bookId
 * @returns (Promise<boolean>)
 */
async function updateBookAvailabilityInDB(appCtx: AppContext, bookId: string) {
    const success = await appCtx.dbCtx.books.updateOne({ _id: new ObjectId(bookId) },
        { "$set": { available: true } })
    return success.acknowledged
}