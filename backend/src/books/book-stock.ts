import type { ObjectId } from "mongodb"

interface BookStockInput {
  totalCopies?: number
  availableCopies?: number
  available?: boolean
}

interface BookDocumentBase {
  _id: ObjectId
  title: string
  author: string
  genre: string
  totalCopies?: number
  availableCopies?: number
  available?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface NormalizedBookStock {
  totalCopies: number
  availableCopies: number
  available: boolean
}

export interface BookResponse {
  _id: string
  title: string
  author: string
  genre: string
  totalCopies: number
  availableCopies: number
  available: boolean
  createdAt?: Date
  updatedAt?: Date
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function normalizeBookStock(input: BookStockInput): NormalizedBookStock {
  const hasTotal = Number.isFinite(input.totalCopies)
  const hasAvailableCopies = Number.isFinite(input.availableCopies)

  if (hasTotal && hasAvailableCopies) {
    const total = Math.max(1, Math.trunc(input.totalCopies as number))
    const availableCopies = clamp(Math.trunc(input.availableCopies as number), 0, total)
    return {
      totalCopies: total,
      availableCopies,
      available: availableCopies > 0,
    }
  }

  if (hasTotal) {
    const total = Math.max(1, Math.trunc(input.totalCopies as number))
    const availableCopies = input.available === false ? 0 : total
    return {
      totalCopies: total,
      availableCopies,
      available: availableCopies > 0,
    }
  }

  if (hasAvailableCopies) {
    const availableCopies = Math.max(0, Math.trunc(input.availableCopies as number))
    const total = Math.max(1, availableCopies)
    return {
      totalCopies: total,
      availableCopies,
      available: availableCopies > 0,
    }
  }

  if (input.available === false) {
    return {
      totalCopies: 1,
      availableCopies: 0,
      available: false,
    }
  }

  return {
    totalCopies: 1,
    availableCopies: 1,
    available: true,
  }
}

export function toBookResponse(book: BookDocumentBase): BookResponse {
  const stock = normalizeBookStock(book)
  return {
    _id: book._id.toHexString(),
    title: book.title,
    author: book.author,
    genre: book.genre,
    totalCopies: stock.totalCopies,
    availableCopies: stock.availableCopies,
    available: stock.available,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  }
}
