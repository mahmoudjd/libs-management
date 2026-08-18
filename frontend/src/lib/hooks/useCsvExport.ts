import { useState } from "react"

import { apiClient } from "@/lib/apiClient"
import { getApiErrorMessage } from "@/lib/api-error"

export type ExportFile = "books.csv" | "loans.csv" | "users.csv"

/** Downloads a CSV export and reports which file is currently being fetched. */
export const useCsvExport = () => {
  const [exportingFile, setExportingFile] = useState<ExportFile | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const exportFile = async (filename: ExportFile) => {
    let blobUrl: string | null = null
    try {
      setExportError(null)
      setExportingFile(filename)
      const response = await apiClient.get(`/exports/${filename}`, { responseType: "blob" })

      blobUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      setExportError(getApiErrorMessage(error, `Failed to export ${filename}`))
    } finally {
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl)
      }
      setExportingFile(null)
    }
  }

  return { exportFile, exportingFile, exportError }
}
