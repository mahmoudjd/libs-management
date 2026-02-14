import { ObjectId } from "mongodb"

export function parseObjectId(id: string): ObjectId | null {
  if (!ObjectId.isValid(id)) {
    return null
  }

  return new ObjectId(id)
}
