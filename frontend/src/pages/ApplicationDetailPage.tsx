import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { StateMessage } from '../components/StateMessage'
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
  loading: boolean
  error: string
  errorStatus: number | null
}

const initialDetailState: DetailState = {
  applicationId: null,
  application: null,
  customer: null,
  loading: true,
  error: '',
  errorStatus: null,
}

const allowedTransitions: Record<LoanApplication['status'], LoanApplication['status'][]> = {
  CREATED: ['DOCUMENTS_PENDING'],
  DOCUMENTS_PENDING: ['PROCESSING'],
  PROCESSING: ['VALIDATION'],
  VALIDATION: ['REVIEW'],
  REVIEW: ['APPROVED', 'REJECTED'],
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
  const { refresh } = useOperations()
  const [detail, setDetail] = useState<DetailState>(initialDetailState)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [statusError, setStatusError] = useState('')
  const statusControllerRef = useRef<AbortController | null>(null)

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
          loading: true,
          error: '',
          errorStatus: null,
        })

        try {
          const customerResult = await api.getCustomer(applicationResult.customer_id, controller.signal)
          if (active && !controller.signal.aborted) {
            setDetail((current) => current.applicationId === applicationId
              ? { ...current, customer: customerResult, loading: false }
              : current)
          }
        } catch (customerError) {
          if (active && !isAbortError(customerError)) {
            setDetail((current) => current.applicationId === applicationId
              ? { ...current, customer: null, loading: false }
              : current)
          }
        }
      } catch (loadError) {
        if (!active || isAbortError(loadError) || controller.signal.aborted) return
        setDetail({
          applicationId,
          application: null,
          customer: null,
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
  }, [applicationId])

  const currentDetail = detail.applicationId === applicationId ? detail : {
    applicationId,
    application: null,
    customer: null,
    loading: Boolean(applicationId),
    error: '',
    errorStatus: null,
  }
  const { application, customer, loading, error, errorStatus } = currentDetail
  const detailError = errorStatus === 404
    ? 'Application not found.'
    : errorStatus === 401
      ? 'Authentication is required or the API key is invalid.'
      : error

  const updateStatus = async (status: LoanApplication['status']) => {
    if (!application || statusUpdating) return
    statusControllerRef.current?.abort()
    const controller = new AbortController()
    statusControllerRef.current = controller
    setStatusUpdating(true)
    setStatusError('')
    try {
      const updated = await api.updateApplicationStatus(application.application_id, { status }, controller.signal)
      setDetail((current) => current.applicationId === application.application_id
        ? { ...current, application: updated }
        : current)
      await refresh()
    } catch (updateError) {
      if (isAbortError(updateError) || controller.signal.aborted) return
      setStatusError(updateError instanceof Error ? updateError.message : 'Unable to update application status.')
    } finally {
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
      {!applicationId ? (
        <StateMessage tone="error">Application ID is missing.</StateMessage>
      ) : loading ? (
        <StateMessage>Loading application...</StateMessage>
      ) : error ? (
        <StateMessage tone="error">{detailError}</StateMessage>
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
              <ul className="detail-list">
                <li><strong>Name:</strong> {customer?.name ?? 'Unknown customer'}</li>
                <li><strong>Email:</strong> {customer?.email ?? 'Not available'}</li>
                <li><strong>Phone:</strong> {customer?.phone ?? 'Not available'}</li>
                <li><strong>Customer ID:</strong> {application.customer_id}</li>
              </ul>
              <Link className="secondary-button detail-link" to={`/customers/${application.customer_id}`}>View customer</Link>
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
              {allowedTransitions[application.status].length > 0 ? (
                <div className="status-actions">
                  <span className="form-label">Supported next actions</span>
                  {allowedTransitions[application.status].map((status) => (
                    <Button key={status} variant={status === 'REJECTED' ? 'secondary' : 'primary'} disabled={statusUpdating} onClick={() => void updateStatus(status)}>
                      {statusUpdating ? 'Updating...' : `Move to ${status.replaceAll('_', ' ')}`}
                    </Button>
                  ))}
                </div>
              ) : (
                <StateMessage>This application is in a terminal status. No further transitions are available.</StateMessage>
              )}
              {statusError ? <StateMessage tone="error">{statusError}</StateMessage> : null}
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
