import type { LoanDocument } from '../types'
import { Alert } from './Alert'
import { DocumentList } from './DocumentList'
import { DocumentUploader } from './DocumentUploader'

export interface DocumentManagerProps {
  applicationId: string
  documents?: LoanDocument[]
  loading?: boolean
  error?: string
  upload?: (applicationId: string, file: File) => Promise<unknown>
  onDownload?: (document: LoanDocument) => void
}

export function DocumentManager({
  applicationId,
  documents = [],
  loading = false,
  error,
  upload,
  onDownload,
}: DocumentManagerProps) {
  return (
    <div className="document-manager" data-application-id={applicationId}>
      <Alert tone="warning" title="Backend integration pending">
        Document listing and download endpoints are not available. Upload selection and validation work locally, but files are not submitted until the backend endpoint contract is implemented.
      </Alert>
      <DocumentUploader applicationId={applicationId} upload={upload} />
      {error ? <Alert tone="error">{error}</Alert> : null}
      <DocumentList documents={documents} loading={loading} onDownload={onDownload} />
    </div>
  )
}
