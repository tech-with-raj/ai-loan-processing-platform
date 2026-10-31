import type { ProposedDocumentProcessing } from '../types'
import { Badge } from './Badge'

interface DocumentProcessingOverviewProps {
  processing?: ProposedDocumentProcessing | null
  loading?: boolean
  error?: string
}

export function DocumentProcessingOverview({ processing, loading = false, error }: DocumentProcessingOverviewProps) {
  if (loading) {
    return <div className="loading-indicator" role="status"><span className="spinner" aria-hidden="true" />Loading AI processing status...</div>
  }
  if (error) {
    return <div className="alert alert-error" role="alert">{error}</div>
  }
  if (!processing) {
    return (
      <div className="processing-overview processing-overview-disconnected" role="status">
        <div>
          <strong>AI processing not connected</strong>
          <p>Processing status, stage, extraction, and validation data are awaiting backend integration.</p>
        </div>
        <Badge tone="warning">Disconnected</Badge>
      </div>
    )
  }

  const status = processing.processing_status?.replaceAll('_', ' ') ?? 'Not started'

  return (
    <dl className="processing-overview" aria-label="Document processing overview">
      <div><dt>Processing status</dt><dd>{status}</dd></div>
      <div><dt>Processing stage</dt><dd>{processing.processing_stage || 'Not available'}</dd></div>
      <div><dt>Last update</dt><dd>{processing.last_processed_at ? new Date(processing.last_processed_at).toLocaleString() : 'Not available'}</dd></div>
      <div><dt>Extraction</dt><dd>{processing.extraction_available ? 'Available' : 'Not available'}</dd></div>
      <div><dt>Validation</dt><dd>{processing.validation_status?.replaceAll('_', ' ') ?? 'Not started'}</dd></div>
      <div><dt>Human review</dt><dd>{processing.human_review_required ? 'Required' : 'Not required'}</dd></div>
    </dl>
  )
}
