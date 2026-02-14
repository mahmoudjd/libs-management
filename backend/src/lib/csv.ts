function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) {
    return ""
  }

  const stringValue = String(value)
  if (!/[",\n]/.test(stringValue)) {
    return stringValue
  }

  return `"${stringValue.replace(/"/g, '""')}"`
}

export function buildCsv(
  headers: string[],
  rows: Array<Record<string, unknown>>
) {
  const lines = [headers.join(",")]

  for (const row of rows) {
    const values = headers.map((header) => escapeCsvValue(row[header]))
    lines.push(values.join(","))
  }

  return `${lines.join("\n")}\n`
}
