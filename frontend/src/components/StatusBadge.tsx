import type { ApplicationStatus } from '../types'

interface StatusBadgeProps {
  status: ApplicationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const className = status.toLowerCase().replaceAll('_', '-')
  return (
    <span className={`status-pill status-${className}`} aria-label={`Application status: ${status.replaceAll('_', ' ')}`}>
      {status.replaceAll('_', ' ')}
    </span>
  )
}
