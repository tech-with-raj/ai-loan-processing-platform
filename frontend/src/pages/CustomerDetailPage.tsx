import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { StateMessage } from '../components/StateMessage'
import { ApplicationTable } from '../components/ApplicationTable'
import { ApiError, api, isAbortError } from '../services/api'
import { useOperations } from '../hooks/useOperations'
import type { Customer } from '../types'

export function CustomerDetailPage() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const { applications } = useOperations()
  const [detail, setDetail] = useState<{
    customerId: string | null
    customer: Customer | null
    loading: boolean
    error: string
  }>({ customerId: null, customer: null, loading: true, error: '' })

  useEffect(() => {
    if (!customerId) {
      return
    }
    const controller = new AbortController()
    let active = true
    const load = async () => {
      try {
        const result = await api.getCustomer(customerId, controller.signal)
        if (active && !controller.signal.aborted) {
          setDetail({ customerId, customer: result, loading: false, error: '' })
        }
      } catch (requestError) {
        if (!active || isAbortError(requestError) || controller.signal.aborted) return
        setDetail({
          customerId,
          customer: null,
          loading: false,
          error: requestError instanceof ApiError && requestError.status === 404
            ? 'Customer not found.'
            : requestError instanceof Error ? requestError.message : 'Unable to load the customer.',
        })
      }
    }
    void load()
    return () => {
      active = false
      controller.abort()
    }
  }, [customerId])

  const associatedApplications = applications.filter((item) => item.customer_id === customerId)
  const currentDetail = detail.customerId === customerId ? detail : {
    customerId,
    customer: null,
    loading: Boolean(customerId),
    error: '',
  }
  const { customer, loading, error } = currentDetail

  return (
    <>
      <PageHeader
        eyebrow="Customer operations"
        title={customer?.name ?? 'Customer Details'}
        actions={<Link className="secondary-button" to="/customers">Back to customers</Link>}
      />
      {!customerId ? (
        <StateMessage tone="error">Customer ID is missing.</StateMessage>
      ) : loading ? (
        <StateMessage>Loading customer...</StateMessage>
      ) : error ? (
        <StateMessage tone="error">{error}</StateMessage>
      ) : customer ? (
        <>
          <div className="details-grid customer-details-grid">
            <div className="detail-card"><span>Name</span><strong>{customer.name}</strong></div>
            <div className="detail-card"><span>Email</span><strong>{customer.email}</strong></div>
            <div className="detail-card"><span>Phone</span><strong>{customer.phone ?? 'Not provided'}</strong></div>
            <div className="detail-card"><span>Created</span><strong>{new Date(customer.created_at).toLocaleString()}</strong></div>
          </div>
          <Card title={<h3>Associated Loan Applications</h3>}>
            {associatedApplications.length === 0
              ? <StateMessage>No loaded applications are associated with this customer.</StateMessage>
              : <ApplicationTable applications={associatedApplications} customers={[customer]} onSelect={(id) => navigate(`/applications/${id}`)} />}
          </Card>
        </>
      ) : null}
    </>
  )
}
