import type { ApplicationStatus } from '../types'

interface StatusBadgeProps {
  status: ApplicationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const className = status.toLowerCase().replaceAll('_', '-')
  const displayStatus: Record<ApplicationStatus, string> = {
    CREATED: 'Draft',
    DOCUMENTS_PENDING: 'Submitted',
    PROCESSING: 'Processing',
    VALIDATION: 'Validation',
    REVIEW: 'Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  }
  return (
    <span className={`status-pill status-${className}`} aria-label={`Application status: ${status.replaceAll('_', ' ')}`}>
      {displayStatus[status]}
    </span>
  )
}
