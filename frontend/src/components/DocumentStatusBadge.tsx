import type { DocumentStatus } from '../types'

interface DocumentStatusBadgeProps {
  status: DocumentStatus
}

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  const className = status.toLowerCase().replaceAll('_', '-')
  return (
    <span
      className={`status-pill document-status-${className}`}
      aria-label={`Document status: ${status.replaceAll('_', ' ')}`}
    >
      {status.replaceAll('_', ' ')}
    </span>
  )
}
