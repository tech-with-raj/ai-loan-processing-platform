import type { LoanDocument } from '../types'
import { DocumentCard } from './DocumentCard'
import { EmptyState, LoadingIndicator } from './FeedbackStates'

export interface DocumentListProps {
  documents: LoanDocument[]
  loading?: boolean
  onDownload?: (document: LoanDocument) => void
}

export function DocumentList({ documents, loading = false, onDownload }: DocumentListProps) {
  if (loading) return <LoadingIndicator>Loading documents...</LoadingIndicator>
  if (documents.length === 0) {
    return (
      <EmptyState title="No documents uploaded">
        Documents associated with this application will appear here.
      </EmptyState>
    )
  }

  return (
    <div className="document-list">
      {documents.map((document) => (
        <DocumentCard key={document.document_id} document={document} onDownload={onDownload} />
      ))}
    </div>
  )
}
