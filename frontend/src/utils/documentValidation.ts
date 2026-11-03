export const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const

export function validateDocumentFile(file: File): string | null {
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type as typeof ALLOWED_DOCUMENT_TYPES[number])) {
    return 'Choose a PDF, JPEG, or PNG file.'
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return 'The file must be 5 MB or smaller.'
  }
  return null
}
