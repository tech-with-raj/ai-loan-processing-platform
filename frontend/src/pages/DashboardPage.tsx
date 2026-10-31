import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StateMessage } from '../components/StateMessage'
import { ApplicationTable } from '../components/ApplicationTable'
import { Card } from '../components/Card'
import { SearchInput } from '../components/SearchInput'
import { useOperations } from '../hooks/useOperations'

export function DashboardPage() {
  const { applications, customers, applicationsLoading, applicationsError } = useOperations()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filteredApplications = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return applications
    return applications.filter((application) => {
      const customer = customers.find((item) => item.customer_id === application.customer_id)
      return [
        application.application_id,
        application.loan_type,
        application.status,
        customer?.name ?? '',
      ].join(' ').toLowerCase().includes(normalized)
    })
  }, [applications, customers, query])

  const summary = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((item) => item.status === 'CREATED' || item.status === 'DOCUMENTS_PENDING').length,
    approved: applications.filter((item) => item.status === 'APPROVED').length,
    rejected: applications.filter((item) => item.status === 'REJECTED').length,
    review: applications.filter((item) => item.status === 'REVIEW').length,
  }), [applications])

  const statusDistribution = useMemo(() => {
    const order = ['CREATED', 'DOCUMENTS_PENDING', 'PROCESSING', 'VALIDATION', 'REVIEW', 'APPROVED', 'REJECTED'] as const
    return order.map((status) => ({
      status,
      count: applications.filter((item) => item.status === status).length,
    })).filter((item) => item.count > 0)
  }, [applications])

  return (
    <>
      <PageHeader
        eyebrow="Loan officer workspace"
        title="Operations Dashboard"
        actions={<Link className="primary-button" to="/applications">Create new application</Link>}
      />

      <section className="stats-grid" aria-label="Application summary metrics">
        <div className="stat-card"><span>Loaded Applications</span><strong>{summary.total}</strong></div>
        <div className="stat-card"><span>Loaded Pending</span><strong>{summary.pending}</strong></div>
        <div className="stat-card"><span>Loaded Approved</span><strong>{summary.approved}</strong></div>
        <div className="stat-card"><span>Loaded Requiring Review</span><strong>{summary.review}</strong></div>
      </section>

      <Card className="status-distribution-card" title={<h3>Loaded Application Status Distribution</h3>}>
        {statusDistribution.length === 0 ? (
          <StateMessage>No loaded applications are available.</StateMessage>
        ) : (
          <div className="status-distribution" aria-label="Status distribution from loaded applications">
            {statusDistribution.map((item) => (
              <div className="status-distribution-item" key={item.status}>
                <span>{item.status.replaceAll('_', ' ')}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title={<h3>Recent Applications</h3>}
        actions={
          <div className="table-controls">
            <SearchInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search applications"
              aria-label="Search applications"
            />
            <Link className="secondary-button" to="/applications">View all</Link>
          </div>
        }
      >

        {applicationsLoading ? (
          <StateMessage>Loading applications...</StateMessage>
        ) : applicationsError ? (
          <StateMessage tone="error">{applicationsError}</StateMessage>
        ) : filteredApplications.length === 0 ? (
          <StateMessage>No applications match your current filter.</StateMessage>
        ) : (
          <ApplicationTable
            applications={filteredApplications}
            customers={customers}
            maxRows={8}
            onSelect={(applicationId) => navigate(`/applications/${applicationId}`)}
          />
        )}
      </Card>
    </>
  )
}
