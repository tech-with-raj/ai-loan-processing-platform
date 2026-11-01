import { useRef, useState } from 'react'
import { Alert } from './Alert'
import { Button } from './Button'

interface HumanDecisionPanelProps {
  applicationStatus: string
  submitting?: boolean
  success?: string
  error?: string
  onApprove?: () => Promise<void>
  onReject?: () => Promise<void>
}

export function HumanDecisionPanel({
  applicationStatus,
  submitting = false,
  success,
  error,
  onApprove,
  onReject,
}: HumanDecisionPanelProps) {
  const [pendingDecision, setPendingDecision] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [confirmationPending, setConfirmationPending] = useState(false)
  const confirmationSubmittingRef = useRef(false)

  const confirm = async () => {
    if (!pendingDecision) return
    if (confirmationSubmittingRef.current) return
    confirmationSubmittingRef.current = true
    setConfirmationPending(true)
    try {
      if (pendingDecision === 'APPROVE') await onApprove?.()
      if (pendingDecision === 'REJECT') await onReject?.()
    } catch {
      // Parent mutation handlers surface the operation-specific error.
    } finally {
      confirmationSubmittingRef.current = false
      setConfirmationPending(false)
      setPendingDecision(null)
    }
  }

  const connected = applicationStatus === 'REVIEW' && Boolean(onApprove && onReject)

  return (
    <div className="human-decision-panel">
      <Alert tone="info" title="Human decision authority">
        AI information is advisory. The reviewer is responsible for the final loan decision.
      </Alert>

      <div className="decision-actions">
        <Button disabled={!connected || submitting} onClick={() => setPendingDecision('APPROVE')}>
          Approve
        </Button>
        <Button
          variant="danger"
          disabled={!connected || submitting}
          onClick={() => setPendingDecision('REJECT')}
        >
          Reject
        </Button>
        <Button variant="ghost" disabled>
          Request additional information — unavailable
        </Button>
        <Button variant="ghost" disabled>
          Escalate — unavailable
        </Button>
      </div>

      {!connected ? (
        <Alert tone="warning">
          Approved and rejected actions require a backend application in `REVIEW` status and an authorized status-transition endpoint.
          Request-information and escalation actions require separate backend endpoints and schemas.
        </Alert>
      ) : null}

      {pendingDecision ? (
        <div className="decision-confirmation" role="group" aria-label={`Confirm ${pendingDecision.toLowerCase()}`}>
          <strong>Confirm {pendingDecision.toLowerCase()} decision</strong>
          {pendingDecision === 'REJECT' ? (
            <p>This action will persist rejection through the backend application status endpoint.</p>
          ) : (
            <p>This action will persist approval through the backend application status endpoint.</p>
          )}
          <div className="decision-actions">
            <Button
              type="button"
              disabled={submitting || confirmationPending}
              aria-busy={submitting || confirmationPending}
              onClick={() => void confirm()}
            >
              {submitting || confirmationPending ? 'Submitting...' : `Confirm ${pendingDecision.toLowerCase()}`}
            </Button>
            <Button type="button" variant="secondary" disabled={submitting || confirmationPending} onClick={() => setPendingDecision(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {success ? <Alert tone="success">{success}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}
    </div>
  )
}
