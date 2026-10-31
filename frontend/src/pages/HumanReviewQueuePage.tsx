import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplicationTable } from '../components/ApplicationTable'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { SearchInput } from '../components/SearchInput'
import { Select } from '../components/FormControls'
import { StateMessage } from '../components/StateMessage'
import { useOperations } from '../hooks/useOperations'

export function HumanReviewQueuePage() {
  const navigate = useNavigate()
  const {
    applications,
    customers,
    applicationsLoading,
    applicationsError,
  } = useOperations()
  const [query, setQuery] = useState('')
  const [reviewStatus, setReviewStatus] = useState('REVIEW')
  const [applicationStatus, setApplicationStatus] = useState('ALL')

  const reviewApplications = useMemo(() => applications.filter((application) => {
    if (application.status !== 'REVIEW') return false
    if (applicationStatus !== 'ALL' && application.status !== applicationStatus) return false
    const customer = customers.find((item) => item.customer_id === application.customer_id)
    const normalized = query.trim().toLowerCase()
    return !normalized || [
      application.application_id,
      application.loan_type,
      application.status,
      customer?.name ?? '',
    ].join(' ').toLowerCase().includes(normalized)
  }), [applicationStatus, applications, customers, query])

  return (
    <>
      <PageHeader eyebrow="Human oversight" title="Human Review Queue" />
      <Card title={<h3>Applications requiring review</h3>}>
        <div className="review-filter-bar" aria-label="Review queue filters">
          <SearchInput
            label="Search review applications"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by application or customer"
          />
          <Select
            label="Review status"
            value={reviewStatus}
            onChange={(event) => setReviewStatus(event.target.value)}
          >
            <option value="REVIEW">Review</option>
          </Select>
          <Select
            label="Application status"
            value={applicationStatus}
            onChange={(event) => setApplicationStatus(event.target.value)}
          >
            <option value="ALL">All application statuses in review</option>
            <option value="REVIEW">Review</option>
          </Select>
        </div>

        {applicationsLoading ? (
          <StateMessage>Loading review applications...</StateMessage>
        ) : applicationsError ? (
          <StateMessage tone="error">{applicationsError}</StateMessage>
        ) : reviewApplications.length === 0 ? (
          <StateMessage>No applications currently have the backend `REVIEW` status.</StateMessage>
        ) : (
          <ApplicationTable
            applications={reviewApplications}
            customers={customers}
            onSelect={(applicationId) => navigate(`/applications/${applicationId}/review`)}
          />
        )}
      </Card>
      <Card title={<h3>Review queue integration</h3>}>
        <StateMessage>
          A dedicated review assignment API is not available. This queue uses the confirmed application status `REVIEW`;
          reviewer assignment and review-status metadata are not inferred or displayed.
        </StateMessage>
      </Card>
    </>
  )
}
