import { useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApplicationTable } from '../components/ApplicationTable'
import { Button } from '../components/Button'
import { Input, Select } from '../components/FormControls'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { SearchInput } from '../components/SearchInput'
import { Pagination } from '../components/Pagination'
import { StateMessage } from '../components/StateMessage'
import { useOperations } from '../hooks/useOperations'
import { api } from '../services/api'
import { EmptyState, LoadingIndicator, ErrorState } from '../components/FeedbackStates'
import type { CreateApplicationInput, LoanApplication } from '../types'

const initialForm: CreateApplicationInput = {
  customer_id: '',
  loan_type: 'Personal Loan',
  loan_amount: '50000.00',
}

function ApplicationForm() {
  const {
    customers,
    customersLoading,
    customersError,
    refresh,
  } = useOperations()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<LoanApplication | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) return
    if (!form.customer_id || !form.loan_type || !form.loan_amount) {
      setError('Please complete all required fields.')
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setError('')
    try {
      const application = await api.createApplication(form)
      setCreated(application)
      setForm(initialForm)
      await refresh()
      navigate(`/applications/${application.application_id}`, { state: { created: true } })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create the application.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <form className="application-form" onSubmit={submit}>
      <fieldset className="form-section">
        <legend>Customer information</legend>
        <span className="form-label">Customer</span>
        {customersLoading ? (
          <select className="form-control" disabled aria-label="Customer"><option>Loading customers...</option></select>
        ) : customersError ? (
          <ErrorState title="Customers unavailable" onRetry={() => void refresh()}>
            {customersError}
          </ErrorState>
        ) : customers.length === 0 ? (
          <EmptyState title="Create a customer first">
            A customer is required before a loan application can be submitted.
          </EmptyState>
        ) : (
          <Select
            label="Customer"
            value={form.customer_id}
            onChange={(event) => setForm((current) => ({ ...current, customer_id: event.target.value }))}
            required
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.customer_id} value={customer.customer_id}>{customer.name}</option>
            ))}
          </Select>
        )}
      </fieldset>
      <fieldset className="form-section">
        <legend>Loan information</legend>
        <Select
          label="Loan Type"
          value={form.loan_type}
          onChange={(event) => setForm((current) => ({ ...current, loan_type: event.target.value as CreateApplicationInput['loan_type'] }))}
        >
          <option>Personal Loan</option>
          <option>Home Loan</option>
          <option>Vehicle Loan</option>
          <option>Business Loan</option>
        </Select>
        <Input
          label="Loan Amount (INR)"
          type="number"
          min="1000"
          step="0.01"
          value={form.loan_amount}
          onChange={(event) => setForm((current) => ({ ...current, loan_amount: event.target.value }))}
          required
        />
      </fieldset>
      {error ? <StateMessage tone="error">{error}</StateMessage> : null}
      {created ? <StateMessage tone="success">Application created successfully.</StateMessage> : null}
      <Button
        fullWidth
        type="submit"
        disabled={submitting || customersLoading || Boolean(customersError) || customers.length === 0}
        aria-busy={submitting}
      >
        {submitting ? 'Submitting application...' : 'Submit application'}
      </Button>
    </form>
  )
}

export function ApplicationsPage() {
  const navigate = useNavigate()
  const {
    applications,
    customers,
    applicationsLoading,
    applicationsError,
    refresh,
  } = useOperations()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loanTypeFilter, setLoanTypeFilter] = useState('ALL')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'amount-high' | 'amount-low'>('newest')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(() => applications.filter((application) => {
    const customer = customers.find((item) => item.customer_id === application.customer_id)
    const normalized = query.trim().toLowerCase()
    const matchesSearch = !normalized || [
      application.application_id,
      application.loan_type,
      application.status,
      customer?.name ?? '',
    ].join(' ').toLowerCase().includes(normalized)
    const matchesStatus = statusFilter === 'ALL' || application.status === statusFilter
    const matchesLoanType = loanTypeFilter === 'ALL' || application.loan_type === loanTypeFilter
    return matchesSearch && matchesStatus && matchesLoanType
  }), [applications, customers, loanTypeFilter, query, statusFilter])

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    if (sort === 'amount-high') return Number(b.loan_amount) - Number(a.loan_amount)
    if (sort === 'amount-low') return Number(a.loan_amount) - Number(b.loan_amount)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  }), [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visible = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <>
      <PageHeader eyebrow="Loan operations" title="Loan Applications" />
      <div className="panel-grid applications-grid">
        <Card
          className="large-panel"
          title={<h3>Applications</h3>}
          actions={
            <div className="table-controls">
              <SearchInput
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Search applications"
                aria-label="Search applications"
              />
            </div>
          }
        >
          <div className="filter-bar" aria-label="Application filters">
            <Select label="Status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }}>
              <option value="ALL">All statuses</option>
              <option value="CREATED">Created</option>
              <option value="DOCUMENTS_PENDING">Documents pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="VALIDATION">Validation</option>
              <option value="REVIEW">Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </Select>
            <Select label="Loan Type" value={loanTypeFilter} onChange={(event) => { setLoanTypeFilter(event.target.value); setPage(1) }}>
              <option value="ALL">All loan types</option>
              <option>Personal Loan</option>
              <option>Home Loan</option>
              <option>Vehicle Loan</option>
              <option>Business Loan</option>
            </Select>
            <Select label="Sort" value={sort} onChange={(event) => { setSort(event.target.value as typeof sort); setPage(1) }}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amount-high">Amount: high to low</option>
              <option value="amount-low">Amount: low to high</option>
            </Select>
          </div>
          {applicationsLoading ? (
            <LoadingIndicator>Loading loan applications...</LoadingIndicator>
          ) : applicationsError ? (
            <ErrorState title="Loan applications unavailable" onRetry={() => void refresh()}>
              {applicationsError}
            </ErrorState>
          ) : applications.length === 0 && query.trim() === '' && statusFilter === 'ALL' && loanTypeFilter === 'ALL' ? (
            <EmptyState
              title="No loan applications yet"
            >
              Create a customer if needed, then submit the first loan application.
            </EmptyState>
          ) : visible.length === 0 ? (
            <EmptyState title="No applications match your current filter.">
              Adjust the search, status, loan type, or sorting criteria.
            </EmptyState>
          ) : (
            <>
              <ApplicationTable
                applications={visible}
                customers={customers}
                onSelect={(applicationId) => navigate(`/applications/${applicationId}`)}
              />
              <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </Card>
        <Card title={<h3>Create Loan Application</h3>}>
          <ApplicationForm />
        </Card>
      </div>
    </>
  )
}
