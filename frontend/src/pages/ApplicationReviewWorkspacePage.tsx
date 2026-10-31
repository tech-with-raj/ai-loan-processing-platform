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
import { ApiError } from '../services/api'
import type { ApplicationStatus, Customer, LoanApplication } from '../types'
import { Button } from '../components/Button'

export function ApplicationReviewWorkspacePage() {
  const { applicationId } = useParams()
  const { refresh } = useOperations()
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerError, setCustomerError] = useState('')
  const [customerErrorStatus, setCustomerErrorStatus] = useState<number | null>(null)
  const [customerRetryKey, setCustomerRetryKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [decisionSubmitting, setDecisionSubmitting] = useState(false)
  const [decisionSuccess, setDecisionSuccess] = useState('')
  const [decisionError, setDecisionError] = useState('')
  const decisionControllerRef = useRef<AbortController | null>(null)
  const decisionSubmittingRef = useRef(false)

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
      setCustomerLoading(false)
      setCustomerError('')
      setCustomerErrorStatus(null)
    })

    void (async () => {
      try {
        const applicationResult = await api.getApplication(applicationId, controller.signal)
        if (!active || controller.signal.aborted) return
        setApplication(applicationResult)
        setLoading(false)
        setCustomerLoading(true)
        try {
          const customerResult = await api.getCustomer(applicationResult.customer_id, controller.signal)
          if (active && !controller.signal.aborted) {
            setCustomer(customerResult)
            setCustomerLoading(false)
            setCustomerError('')
            setCustomerErrorStatus(null)
          }
        } catch (customerError) {
          if (active && !isAbortError(customerError)) {
            setCustomer(null)
            setCustomerLoading(false)
            setCustomerErrorStatus(customerError instanceof ApiError ? customerError.status : null)
            setCustomerError(customerError instanceof Error
              ? customerError.message
              : 'Unable to load customer information.')
          }
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
  }, [applicationId, customerRetryKey])

  const submitDecision = async (status: 'APPROVED' | 'REJECTED') => {
    if (!application || application.status !== 'REVIEW' || decisionSubmittingRef.current) return
    decisionSubmittingRef.current = true
    decisionControllerRef.current?.abort()
    const controller = new AbortController()
    decisionControllerRef.current = controller
    setDecisionSubmitting(true)
    setDecisionSuccess('')
    setDecisionError('')
    try {
      const updated = await api.updateApplicationStatus(application.application_id, { status }, controller.signal)
      const validStatus: ApplicationStatus[] = ['CREATED', 'DOCUMENTS_PENDING', 'PROCESSING', 'VALIDATION', 'REVIEW', 'APPROVED', 'REJECTED']
      const requestedDecision = status === 'APPROVED' ? 'approval' : 'rejection'
      if (!validStatus.includes(updated.status) || updated.status !== status) {
        setDecisionError(`The requested ${requestedDecision} was not confirmed by the backend${validStatus.includes(updated.status) ? `. Backend status: ${updated.status.replaceAll('_', ' ')}` : ''}.`)
        try {
          const refreshedApplication = await api.getApplication(application.application_id, controller.signal)
          if (!controller.signal.aborted) setApplication(refreshedApplication)
        } catch {
          // Keep the explicit unconfirmed-decision error visible if the refresh fails.
        }
        await refresh()
        return
      }
      setApplication(updated)
      await refresh()
      setDecisionSuccess(`Backend confirmed the application status as ${updated.status.replaceAll('_', ' ')}.`)
    } catch (decisionFailure) {
      if (isAbortError(decisionFailure) || controller.signal.aborted) return
      setDecisionError(decisionFailure instanceof Error ? decisionFailure.message : 'Unable to record the human decision.')
    } finally {
      decisionSubmittingRef.current = false
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
              <div>
                <dt>Customer</dt>
                <dd>
                  {customerLoading ? (
                    'Loading customer information...'
                  ) : customerError ? (
                    <span>
                      {customerErrorStatus === 404
                        ? 'Customer record not found.'
                        : `Customer information could not be loaded: ${customerError}`}
                      {customerErrorStatus !== 404 ? (
                        <Button
                          variant="secondary"
                          onClick={() => setCustomerRetryKey((current) => current + 1)}
                        >
                          Retry customer information
                        </Button>
                      ) : null}
                    </span>
                  ) : customer ? customer.name : 'Customer information is unavailable.'}
                </dd>
              </div>
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
