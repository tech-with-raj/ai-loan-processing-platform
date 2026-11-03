import { Alert } from './Alert'

export function ReviewHistory() {
  return (
    <Alert tone="warning" title="Review audit history pending">
      No audit API is available. BestBank cannot safely display review events, comments, decisions, escalations, timestamps, or actor identities without backend audit records.
    </Alert>
  )
}
