import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { StateMessage } from '../components/StateMessage'
import { HumanDecisionPanel } from '../components/HumanDecisionPanel'
import { HumanReviewNotes } from '../components/HumanReviewNotes'
import { ReviewHistory } from '../components/ReviewHistory'
import { AiDocumentProcessing } from '../components/AiDocumentProcessing'
import { DocumentList } from '../components/DocumentList'
import { useOperations } from '../hooks/useOperations'
import { api, isAbortError } from '../services/api'
import type { Customer, LoanApplication } from '../types'

export function ApplicationReviewWorkspacePage() {
  const { applicationId } = useParams()
  const { refresh } = useOperations()
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [decisionSubmitting, setDecisionSubmitting] = useState(false)
  const [decisionSuccess, setDecisionSuccess] = useState('')
  const [decisionError, setDecisionError] = useState('')
  const decisionControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!applicationId) return
    const controller = new AbortController()
    let active = true
    queueMicrotask(() => {
      if (!active) return
      setLoading(true)
      setError('')
      setApplication(null)
      setCustomer(null)
    })

    void (async () => {
      try {
        const applicationResult = await api.getApplication(applicationId, controller.signal)
        if (!active || controller.signal.aborted) return
        setApplication(applicationResult)
        try {
          const customerResult = await api.getCustomer(applicationResult.customer_id, controller.signal)
          if (active && !controller.signal.aborted) setCustomer(customerResult)
        } catch (customerError) {
          if (active && !isAbortError(customerError)) setCustomer(null)
        }
      } catch (loadError) {
        if (!active || isAbortError(loadError) || controller.signal.aborted) return
        setError(loadError instanceof Error ? loadError.message : 'Unable to load the review workspace.')
      } finally {
        if (active && !controller.signal.aborted) setLoading(false)
      }
    })()

    return () => {
      active = false
      controller.abort()
      decisionControllerRef.current?.abort()
    }
  }, [applicationId])

  const submitDecision = async (status: 'APPROVED' | 'REJECTED') => {
    if (!application || application.status !== 'REVIEW' || decisionSubmitting) return
    decisionControllerRef.current?.abort()
    const controller = new AbortController()
    decisionControllerRef.current = controller
    setDecisionSubmitting(true)
    setDecisionSuccess('')
    setDecisionError('')
    try {
      const updated = await api.updateApplicationStatus(application.application_id, { status }, controller.signal)
      setApplication(updated)
      await refresh()
      setDecisionSuccess(`Backend confirmed the application status as ${updated.status.replaceAll('_', ' ')}.`)
    } catch (decisionFailure) {
      if (isAbortError(decisionFailure) || controller.signal.aborted) return
      setDecisionError(decisionFailure instanceof Error ? decisionFailure.message : 'Unable to record the human decision.')
    } finally {
      setDecisionSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Human review workspace"
        title={application ? `Application ${application.application_id.slice(0, 8)}` : 'Review Workspace'}
        actions={<Link className="secondary-button" to="/review">Back to review queue</Link>}
      />
      {loading ? (
        <StateMessage>Loading review workspace...</StateMessage>
      ) : error ? (
        <StateMessage tone="error">{error}</StateMessage>
      ) : !application ? (
        <StateMessage tone="error">The application was not found.</StateMessage>
      ) : (
        <div className="review-workspace">
          <Card title={<h3>Application Overview</h3>} className="review-overview-card">
            <dl className="review-overview">
              <div><dt>Application ID</dt><dd>{application.application_id}</dd></div>
              <div><dt>Customer</dt><dd>{customer?.name ?? 'Unknown customer'}</dd></div>
              <div><dt>Loan amount</dt><dd>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(application.loan_amount))}</dd></div>
              <div><dt>Loan purpose</dt><dd>{application.loan_type}</dd></div>
              <div><dt>Application status</dt><dd><StatusBadge status={application.status} /></dd></div>
              <div><dt>Submission date</dt><dd>{new Date(application.created_at).toLocaleString()}</dd></div>
            </dl>
          </Card>

          <Card title={<h3>Document Evidence</h3>}>
            <DocumentList documents={[]} />
            <StateMessage>
              Document listing is pending backend integration. No document has been displayed as verified.
            </StateMessage>
          </Card>

          <Card title={<h3>AI Assessment</h3>}>
            <AiDocumentProcessing />
          </Card>

          <Card title={<h3>Human Review Notes</h3>}>
            <HumanReviewNotes />
          </Card>

          <Card title={<h3>Human Decision</h3>}>
            <HumanDecisionPanel
              applicationStatus={application.status}
              submitting={decisionSubmitting}
              success={decisionSuccess}
              error={decisionError}
              onApprove={() => submitDecision('APPROVED')}
              onReject={() => submitDecision('REJECTED')}
            />
          </Card>

          <Card title={<h3>Review History and Audit Trail</h3>}>
            <ReviewHistory />
          </Card>
        </div>
      )}
    </>
  )
}
