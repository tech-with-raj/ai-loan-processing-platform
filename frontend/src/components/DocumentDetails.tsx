import type { LoanDocument } from '../types'
import { DocumentStatusBadge } from './DocumentStatusBadge'

export interface DocumentDetailsProps {
  document: LoanDocument
}

export function DocumentDetails({ document }: DocumentDetailsProps) {
  return (
    <dl className="document-details">
      <div><dt>Filename</dt><dd>{document.original_filename}</dd></div>
      <div><dt>Content type</dt><dd>{document.content_type}</dd></div>
      <div><dt>Uploaded</dt><dd>{new Date(document.created_at).toLocaleString()}</dd></div>
      <div><dt>Status</dt><dd><DocumentStatusBadge status={document.status} /></dd></div>
      <div><dt>Application</dt><dd>{document.application_id}</dd></div>
    </dl>
  )
}
