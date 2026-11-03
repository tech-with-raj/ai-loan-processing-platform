import { useState } from 'react'
import type { LoanDocument } from '../types'
import { Button } from './Button'
import { DocumentDetails } from './DocumentDetails'
import { DocumentStatusBadge } from './DocumentStatusBadge'

export interface DocumentCardProps {
  document: LoanDocument
  onDownload?: (document: LoanDocument) => void
}

export function DocumentCard({ document, onDownload }: DocumentCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <article className="document-card" aria-label={`Document ${document.original_filename}`}>
      <div className="document-card-main">
        <div>
          <strong className="document-card-name">{document.original_filename}</strong>
          <span className="document-card-meta">
            {document.content_type} · {new Date(document.created_at).toLocaleString()}
          </span>
        </div>
        <DocumentStatusBadge status={document.status} />
      </div>
      <div className="document-card-actions">
        <Button variant="ghost" aria-expanded={showDetails} onClick={() => setShowDetails((current) => !current)}>
          {showDetails ? 'Hide details' : 'Details'}
        </Button>
        {onDownload ? <Button variant="secondary" onClick={() => onDownload(document)}>Download</Button> : null}
      </div>
      {showDetails ? <DocumentDetails document={document} /> : null}
    </article>
  )
}
