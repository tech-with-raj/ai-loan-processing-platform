import type { ReactNode } from 'react'
import { Alert } from './Alert'
import { Button } from './Button'

export function LoadingIndicator({ children = 'Loading...' }: { children?: ReactNode }) {
  return (
    <div className="loading-indicator" role="status" aria-live="polite" aria-atomic="true">
      <span className="spinner" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />
}

export function EmptyState({ title = 'No data available', children, action }: { title?: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty-state" role="status">
      <strong>{title}</strong>
      {children ? <div>{children}</div> : null}
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  )
}

export function ErrorState({ title = 'Unable to complete the request', children, onRetry }: {
  title?: string
  children?: ReactNode
  onRetry?: () => void
}) {
  return (
    <Alert tone="error" title={title}>
      <div>{children}</div>
      {onRetry ? <Button variant="secondary" onClick={onRetry}>Try again</Button> : null}
    </Alert>
  )
}
