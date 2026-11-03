import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { StateMessage } from '../components/StateMessage'
import { ErrorState, LoadingIndicator } from '../components/FeedbackStates'
import { StatusBadge } from '../components/StatusBadge'
import { Button } from '../components/Button'
import { DocumentManager } from '../components/DocumentManager'
import { useOperations } from '../hooks/useOperations'
import { ApiError, api, isAbortError } from '../services/api'
import type { Customer, LoanApplication } from '../types'

interface DetailState {
  applicationId: string | null
  application: LoanApplication | null
  customer: Customer | null
  customerLoading: boolean
  customerError: string
  customerErrorStatus: number | null
  loading: boolean
  error: string
  errorStatus: number | null
}

const initialDetailState: DetailState = {
  applicationId: null,
  application: null,
  customer: null,
  customerLoading: false,
  customerError: '',
  customerErrorStatus: null,
  loading: true,
  error: '',
  errorStatus: null,
}

const applicationStatuses: LoanApplication['status'][] = [
  'CREATED',
  'DOCUMENTS_PENDING',
  'PROCESSING',
  'VALIDATION',
  'REVIEW',
  'APPROVED',
  'REJECTED',
]

function isApplicationStatus(value: unknown): value is LoanApplication['status'] {
  return typeof value === 'string' && applicationStatuses.includes(value as LoanApplication['status'])
}

const allowedTransitions: Record<LoanApplication['status'], LoanApplication['status'][]> = {
  CREATED: ['DOCUMENTS_PENDING'],
  DOCUMENTS_PENDING: ['PROCESSING'],
  PROCESSING: ['VALIDATION'],
  VALIDATION: ['REVIEW'],
  REVIEW: [],
  APPROVED: [],
  REJECTED: [],
}

const lifecycleOrder: LoanApplication['status'][] = [
  'CREATED',
  'DOCUMENTS_PENDING',
  'PROCESSING',
  'VALIDATION',
  'REVIEW',
  'APPROVED',
  'REJECTED',
]

function formatCurrency(amount: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount))
}

export function ApplicationDetailPage() {
  const { applicationId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { refresh } = useOperations()
  const [detail, setDetail] = useState<DetailState>(initialDetailState)
  const [customerRetryKey, setCustomerRetryKey] = useState(0)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [statusError, setStatusError] = useState('')
  const [statusSuccess, setStatusSuccess] = useState('')
  const [createdFeedback] = useState(
    () => Boolean(location.state && typeof location.state === 'object' && 'created' in location.state && location.state.created === true),
  )
  const statusControllerRef = useRef<AbortController | null>(null)
  const statusSubmittingRef = useRef(false)

  useEffect(() => {
    const created = location.state && typeof location.state === 'object' && 'created' in location.state && location.state.created === true
    if (!created || !applicationId) return
    navigate(`/applications/${applicationId}`, { replace: true, state: null })
  }, [applicationId, location.state, navigate])

  useEffect(() => {
    if (!applicationId) {
      return
    }

    const controller = new AbortController()
    let active = true

    const load = async () => {
      try {
        const applicationResult = await api.getApplication(applicationId, controller.signal)
        if (!active || controller.signal.aborted) return
        setDetail({
          applicationId,
          application: applicationResult,
          customer: null,
          customerLoading: true,
          customerError: '',
          customerErrorStatus: null,
          loading: false,
          error: '',
          errorStatus: null,
        })

        try {
          const customerResult = await api.getCustomer(applicationResult.customer_id, controller.signal)
          if (active && !controller.signal.aborted) {
            setDetail((current) => current.applicationId === applicationId
              ? { ...current, customer: customerResult, customerLoading: false, customerError: '', customerErrorStatus: null, loading: false }
              : current)
          }
        } catch (customerError) {
          if (active && !isAbortError(customerError)) {
            setDetail((current) => current.applicationId === applicationId
              ? {
                  ...current,
                  customer: null,
                  customerLoading: false,
                  customerErrorStatus: customerError instanceof ApiError ? customerError.status : null,
                  customerError: customerError instanceof Error
                    ? customerError.message
                    : 'Unable to load customer information.',
                  loading: false,
                }
              : current)
          }
        }
      } catch (loadError) {
        if (!active || isAbortError(loadError) || controller.signal.aborted) return
        setDetail({
          applicationId,
          application: null,
          customer: null,
          customerLoading: false,
          customerError: '',
          customerErrorStatus: null,
          loading: false,
          errorStatus: loadError instanceof ApiError ? loadError.status : null,
          error: loadError instanceof Error ? loadError.message : 'Unable to load the application.',
        })
      }
    }

    void load()
    return () => {
      active = false
      controller.abort()
      statusControllerRef.current?.abort()
    }
  }, [applicationId, customerRetryKey])

  const currentDetail = detail.applicationId === applicationId ? detail : {
    applicationId,
    application: null,
    customer: null,
    customerLoading: false,
    customerError: '',
    customerErrorStatus: null,
    loading: Boolean(applicationId),
    error: '',
    errorStatus: null,
  }
  const { application, customer, customerLoading, customerError, customerErrorStatus, loading, error, errorStatus } = currentDetail
  const detailError = errorStatus === 404
    ? 'Application not found.'
    : errorStatus === 401
      ? 'Authentication is required or the API key is invalid.'
      : error

  const updateStatus = async (status: LoanApplication['status']) => {
    if (!application || statusSubmittingRef.current) return
    statusSubmittingRef.current = true
    statusControllerRef.current?.abort()
    const controller = new AbortController()
    statusControllerRef.current = controller
    setStatusUpdating(true)
    setStatusError('')
    setStatusSuccess('')
    try {
    const updated = await api.updateApplicationStatus(application.application_id, { status }, controller.signal)
    if (!isApplicationStatus(updated.status)) {
      setStatusError('The backend returned an unexpected application status. The status could not be confirmed.')
      return
    }
    setDetail((current) => current.applicationId === application.application_id
      ? { ...current, application: updated }
      : current)
    setStatusSuccess(`Backend confirmed the application status as ${updated.status.replaceAll('_', ' ')} successfully.`)
    await refresh()
    } catch (updateError) {
      if (isAbortError(updateError) || controller.signal.aborted) return
      setStatusError(updateError instanceof Error ? updateError.message : 'Unable to update application status.')
    } finally {
      statusSubmittingRef.current = false
      setStatusUpdating(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Loan Application"
        title={application ? `Application ${application.application_id.slice(0, 8)}` : 'Application Details'}
        actions={<Link className="secondary-button" to="/applications">Back to applications</Link>}
      />
      {createdFeedback ? (
        <StateMessage tone="success">Application created successfully.</StateMessage>
      ) : null}
      {!applicationId ? (
        <StateMessage tone="error">Application ID is missing.</StateMessage>
      ) : loading ? (
        <LoadingIndicator>Loading application details...</LoadingIndicator>
      ) : error ? (
        <ErrorState
          title={errorStatus === 404 ? 'Application not found' : 'Application unavailable'}
          onRetry={() => {
            setDetail(initialDetailState)
            setCustomerRetryKey((current) => current + 1)
          }}
        >
          {detailError}
        </ErrorState>
      ) : !application ? (
        <StateMessage tone="error">The application was not found or is unavailable.</StateMessage>
      ) : (
        <>
        <Card className="detail-panel">
          <div className="details-grid">
            <div className="detail-card"><span>Status</span><StatusBadge status={application.status} /></div>
            <div className="detail-card"><span>Loan Type</span><strong>{application.loan_type}</strong></div>
            <div className="detail-card"><span>Loan Amount</span><strong>{formatCurrency(application.loan_amount)}</strong></div>
            <div className="detail-card"><span>Created</span><strong>{new Date(application.created_at).toLocaleString()}</strong></div>
          </div>
          <div className="detail-body-grid">
            <div>
              <h4>Customer Information</h4>
              {customerLoading ? (
                <LoadingIndicator>Loading customer information...</LoadingIndicator>
              ) : customerError ? (
                <ErrorState
                  title={customerErrorStatus === 404 ? 'Customer record not found.' : 'Customer information unavailable'}
                  onRetry={customerErrorStatus === 404 ? undefined : () => setCustomerRetryKey((current) => current + 1)}
                >
                  {customerErrorStatus === 404 ? 'The customer linked to this application is not available.' : customerError}
                </ErrorState>
              ) : customer ? (
                <>
                  <ul className="detail-list">
                    <li><strong>Name:</strong> {customer.name}</li>
                    <li><strong>Email:</strong> {customer.email}</li>
                    <li><strong>Phone:</strong> {customer.phone ?? 'Not provided'}</li>
                    <li><strong>Customer ID:</strong> {customer.customer_id}</li>
                  </ul>
                  <Link className="secondary-button detail-link" to={`/customers/${customer.customer_id}`}>View customer</Link>
                </>
              ) : (
                <StateMessage>Customer information is unavailable.</StateMessage>
              )}
            </div>
            <div>
              <h4>Lifecycle</h4>
              <ol className="lifecycle-list" aria-label="Application lifecycle">
                {lifecycleOrder.filter((status) => status !== 'REJECTED' || application.status === 'REJECTED').map((status) => (
                  <li key={status} className={status === application.status ? 'lifecycle-current' : lifecycleOrder.indexOf(status) < lifecycleOrder.indexOf(application.status) ? 'lifecycle-complete' : ''}>
                    <StatusBadge status={status} />
                  </li>
                ))}
              </ol>
              {application.status === 'REVIEW' ? (
                <div className="status-actions">
                  <StateMessage>
                    Consequential decisions are available only in the dedicated human review workspace.
                  </StateMessage>
                  <Link className="primary-button" to={`/applications/${application.application_id}/review`}>
                    Open human review workspace
                  </Link>
                </div>
              ) : allowedTransitions[application.status].length > 0 ? (
                <div className="status-actions">
                  <span className="form-label">Supported next actions</span>
                  {allowedTransitions[application.status].map((status) => (
                    <Button key={status} variant={status === 'REJECTED' ? 'secondary' : 'primary'} disabled={statusUpdating} aria-busy={statusUpdating} onClick={() => void updateStatus(status)}>
                      {statusUpdating ? 'Updating...' : `Move to ${status.replaceAll('_', ' ')}`}
                    </Button>
                  ))}
                </div>
              ) : (
                <StateMessage>This application is in a terminal status. No further transitions are available.</StateMessage>
              )}
              {statusError ? <StateMessage tone="error">{statusError}</StateMessage> : null}
              {statusSuccess ? <StateMessage tone="success">{statusSuccess}</StateMessage> : null}
            </div>
          </div>
        </Card>
        <div className="detail-support-grid">
          <Card title={<h3>Documents</h3>}>
            <DocumentManager applicationId={application.application_id} />
          </Card>
          <Card title={<h3>Activity and History</h3>}>
            <StateMessage>Activity and audit history are not implemented by the backend yet. Status changes are recorded only by the database application status.</StateMessage>
          </Card>
        </div>
        </>
      )}
    </>
  )
}
