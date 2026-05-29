/** Decode literal \\uXXXX sequences sometimes stored in demo seed rows. */
export function displayText(value: string | null | undefined): string {
  if (!value) return ''
  if (!value.includes('\\u')) return value
  return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16)),
  )
}
