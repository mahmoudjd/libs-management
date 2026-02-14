import axios from "axios"

export function getApiErrorMessage(error: unknown, fallbackMessage = "Unexpected error") {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string; error?: string } | undefined
    if (typeof payload?.message === "string" && payload.message.trim() !== "") {
      return payload.message
    }
    if (typeof payload?.error === "string" && payload.error.trim() !== "") {
      return payload.error
    }
  }

  if (error instanceof Error && error.message.trim() !== "") {
    return error.message
  }

  return fallbackMessage
}
