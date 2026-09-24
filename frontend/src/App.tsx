import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'
import { ApplicationTable } from './components/ApplicationTable'
import { api } from './services/api'
import type { CreateApplicationInput, Customer, LoanApplication } from './types'

const documentStates = [
  'Missing',
  'Uploaded',
  'Processing',
  'Processed',
  'Validation Required',
  'Valid',
  'Invalid',
]

const documentTypes = [
  'Aadhaar',
  'PAN',
  'Salary Slip',
  'Bank Statement',
  'Address Proof',
  'Employment Proof',
]

const initialForm: CreateApplicationInput = {
  customer_id: '',
  loan_type: 'Personal Loan',
  loan_amount: '50000.00',
}

type AppView = 'dashboard' | 'applications' | 'documents' | 'validation' | 'assistant'

function App() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [customersLoading, setCustomersLoading] = useState(true)
  const [customerError, setCustomerError] = useState('')
  const [form, setForm] = useState<CreateApplicationInput>(initialForm)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [createdApp, setCreatedApp] = useState<LoanApplication | null>(null)
  const [query, setQuery] = useState('')
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [activeView, setActiveView] = useState<AppView>('dashboard')

  const selectedApplication = useMemo(
    () => applications.find((application) => application.application_id === selectedApplicationId) ?? null,
    [applications, selectedApplicationId],
  )

  const selectedCustomer = useMemo(
    () => (selectedApplication ? customers.find((customer) => customer.customer_id === selectedApplication.customer_id) ?? null : null),
    [customers, selectedApplication],
  )

  const fetchData = async () => {
    setLoading(true)
    setError('')
    setCustomersLoading(true)
    setCustomerError('')

    const [customersResult, applicationsResult] = await Promise.allSettled([
      api.getCustomers(),
      api.getApplications(),
    ])

    if (customersResult.status === 'fulfilled') {
      setCustomers(customersResult.value)
    } else {
      setCustomerError(
        customersResult.reason instanceof Error
          ? customersResult.reason.message
          : 'Unable to load customers right now.',
      )
    }

    if (applicationsResult.status === 'fulfilled') {
      setApplications(applicationsResult.value)
    } else {
      setError(
        applicationsResult.reason instanceof Error
          ? applicationsResult.reason.message
          : 'Unable to load applications right now.',
      )
    }

    setCustomersLoading(false)
    setLoading(false)
  }

  useEffect(() => {
    void fetchData()
  }, [])

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return applications

    return applications.filter((application) => {
      const customer = customers.find((item) => item.customer_id === application.customer_id)
      const combined = [
        application.application_id,
        application.loan_type,
        application.status,
        customer?.name ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return combined.includes(normalizedQuery)
    })
  }, [applications, customers, query])

  const summary = useMemo(() => {
    const total = applications.length
    const pendingDocs = applications.filter((application) => application.status === 'CREATED').length
    const underValidation = applications.filter((application) => application.status === 'VALIDATION').length
    const requiresReview = applications.filter((application) => application.status === 'REVIEW').length

    return {
      total,
      pendingDocs,
      underValidation,
      requiresReview,
    }
  }, [applications])

  const handleFieldChange = (field: keyof CreateApplicationInput, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')

    if (!form.customer_id || !form.loan_type || !form.loan_amount) {
      setFormError('Please complete all required fields before submitting.')
      return
    }

    setFormLoading(true)

    try {
      const created = await api.createApplication(form)
      setCreatedApp(created)
      setForm(initialForm)
      await fetchData()
      setActiveView('applications')
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : 'The application could not be created. Please try again.',
      )
    } finally {
      setFormLoading(false)
    }
  }

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      return
    }
    setIsAuthenticated(true)
  }

  const formatCurrency = (amount: string) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount))

  const renderApplicationForm = () => (
    <div className="panel form-panel">
      <div className="panel-header">
        <h3>Create Loan Application</h3>
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        <label>
          Customer
          {customersLoading ? (
            <select disabled aria-label="Customer loading">
              <option>Loading customers…</option>
            </select>
          ) : customerError ? (
            <div className="inline-error">{customerError}</div>
          ) : customers.length === 0 ? (
            <div className="state-box">No customers are available for a new application.</div>
          ) : (
            <select
              value={form.customer_id}
              onChange={(event) => handleFieldChange('customer_id', event.target.value)}
              required
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.name}
                </option>
              ))}
            </select>
          )}
        </label>

        <label>
          Loan Type
          <select
            value={form.loan_type}
            onChange={(event) => handleFieldChange('loan_type', event.target.value)}
          >
            <option value="Personal Loan">Personal Loan</option>
            <option value="Home Loan">Home Loan</option>
            <option value="Vehicle Loan">Vehicle Loan</option>
            <option value="Business Loan">Business Loan</option>
          </select>
        </label>

        <label>
          Loan Amount (INR)
          <input
            type="number"
            min="1000"
            step="1000"
            value={form.loan_amount}
            onChange={(event) => handleFieldChange('loan_amount', event.target.value)}
          />
        </label>

        {formError ? <div className="inline-error">{formError}</div> : null}

        {createdApp ? (
          <div className="success-box">
            Application created successfully: {createdApp.application_id.slice(0, 8)}
          </div>
        ) : null}

        <button
          type="submit"
          className="primary-button full-width"
          disabled={formLoading || customersLoading || Boolean(customerError) || customers.length === 0}
        >
          {formLoading ? 'Submitting…' : 'Submit application'}
        </button>
      </form>
    </div>
  )

  const renderApplicationsTable = () => (
    <div className="panel large-panel">
      <div className="panel-header">
        <h3>Applications</h3>
        <div className="table-controls">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search applications"
            aria-label="Search applications"
          />
          <button className="secondary-button" type="button" onClick={() => void fetchData()}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="state-box">Loading applications…</div>
      ) : error ? (
        <div className="state-box error">{error}</div>
      ) : filteredApplications.length === 0 ? (
        <div className="state-box">No applications match your current filter.</div>
      ) : (
          <ApplicationTable
            applications={filteredApplications}
            customers={customers}
            onSelect={setSelectedApplicationId}
          />
      )}
    </div>
  )

  const renderDashboard = () => (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Loan officer workspace</p>
          <h1>Operations Dashboard</h1>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => setActiveView('applications')}
        >
          Create new application
        </button>
      </header>

      <section className="stats-grid" aria-label="Application summary metrics">
        <div className="stat-card">
          <span>Total Applications</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="stat-card">
          <span>Applications Pending Documents</span>
          <strong>{summary.pendingDocs}</strong>
        </div>
        <div className="stat-card">
          <span>Applications Under Validation</span>
          <strong>{summary.underValidation}</strong>
        </div>
        <div className="stat-card">
          <span>Applications Requiring Review</span>
          <strong>{summary.requiresReview}</strong>
        </div>
      </section>

      <section className="panel-grid">
        <div className="panel large-panel">
          <div className="panel-header">
            <h3>Recent Applications</h3>
            <div className="table-controls">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search applications"
                aria-label="Search applications"
              />
              <button className="secondary-button" type="button" onClick={() => void fetchData()}>
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="state-box">Loading applications…</div>
          ) : error ? (
            <div className="state-box error">{error}</div>
          ) : filteredApplications.length === 0 ? (
            <div className="state-box">No applications match your current filter.</div>
          ) : (
            <ApplicationTable
              applications={filteredApplications}
              customers={customers}
              maxRows={8}
              onSelect={setSelectedApplicationId}
            />
          )}
        </div>

        {renderApplicationForm()}
      </section>

      <section className="details-section">
        {selectedApplication ? (
          <div className="panel detail-panel">
            <div className="panel-header">
              <h3>Application Details</h3>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setSelectedApplicationId(null)}
              >
                Close
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-card">
                <span>Application ID</span>
                <strong>{selectedApplication.application_id}</strong>
              </div>
              <div className="detail-card">
                <span>Status</span>
                <strong>{selectedApplication.status}</strong>
              </div>
              <div className="detail-card">
                <span>Loan Type</span>
                <strong>{selectedApplication.loan_type}</strong>
              </div>
              <div className="detail-card">
                <span>Loan Amount</span>
                <strong>{formatCurrency(selectedApplication.loan_amount)}</strong>
              </div>
            </div>

            <div className="detail-body-grid">
              <div>
                <h4>Customer Information</h4>
                <ul className="detail-list">
                  <li><strong>Name:</strong> {selectedCustomer?.name ?? 'Unknown customer'}</li>
                  <li><strong>Email:</strong> {selectedCustomer?.email ?? 'Not available'}</li>
                  <li><strong>Phone:</strong> {selectedCustomer?.phone ?? 'Not available'}</li>
                  <li><strong>Customer ID:</strong> {selectedApplication.customer_id}</li>
                </ul>
              </div>
              <div>
                <h4>Loan Information</h4>
                <ul className="detail-list">
                  <li><strong>Loan Type:</strong> {selectedApplication.loan_type}</li>
                  <li><strong>Loan Amount:</strong> {formatCurrency(selectedApplication.loan_amount)}</li>
                  <li><strong>Created:</strong> {new Date(selectedApplication.created_at).toLocaleString()}</li>
                  <li><strong>Status:</strong> {selectedApplication.status}</li>
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </>
  )

  const renderApplicationsSection = () => (
    <section className="section-shell applications-section">
      <div className="panel-grid applications-grid">
        {renderApplicationsTable()}

        {renderApplicationForm()}
      </div>
    </section>
  )

  const renderDocumentsSection = () => (
    <section className="section-shell">
      <div className="panel">
        <div className="panel-header">
          <h3>Documents</h3>
        </div>
        <div className="document-list">
          {documentTypes.map((type) => (
            <div key={type} className="document-item">
              <div>
                <strong>{type}</strong>
                <small>Coming in the next processing phase</small>
              </div>
              <span className="document-state">{documentStates[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  const renderValidationSection = () => (
    <section className="section-shell">
      <div className="panel">
        <div className="panel-header">
          <h3>Validation</h3>
        </div>
        <div className="placeholder-box">
          Validation workflow is not yet connected to a backend validation endpoint.
        </div>
      </div>
    </section>
  )

  const renderAssistantSection = () => (
    <section className="section-shell">
      <div className="panel">
        <div className="panel-header">
          <h3>AI Assistant</h3>
        </div>
        <div className="assistant-box">
          <label>
            Ask a question about this application...
            <textarea rows={4} placeholder="Ask BestBank AI" />
          </label>
          <button className="secondary-button" type="button">Ask AI</button>
          <p className="placeholder-note">Coming in the next processing phase</p>
        </div>
      </div>
    </section>
  )

  if (!isAuthenticated) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand-block login-brand">
            <div className="brand-mark">B</div>
            <div>
              <h2>BestBank</h2>
              <p>AI-Powered Loan Processing Platform</p>
            </div>
          </div>

          <h1>Loan Officer Sign In</h1>
          <p className="login-subtitle">Demo login screen for the current workflow. No backend auth is connected yet.</p>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="loan.officer@bestbank.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Enter password"
              />
            </label>

            <button className="primary-button full-width" type="submit">
              Sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">B</div>
          <div>
            <h2>BestBank</h2>
            <p>AI-Powered Loan Processing Platform</p>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          <button className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} type="button" onClick={() => setActiveView('dashboard')}>Dashboard</button>
          <button className={`nav-item ${activeView === 'applications' ? 'active' : ''}`} type="button" onClick={() => setActiveView('applications')}>Applications</button>
          <button className={`nav-item ${activeView === 'documents' ? 'active' : ''}`} type="button" onClick={() => setActiveView('documents')}>Documents</button>
          <button className={`nav-item ${activeView === 'validation' ? 'active' : ''}`} type="button" onClick={() => setActiveView('validation')}>Validation</button>
          <button className={`nav-item ${activeView === 'assistant' ? 'active' : ''}`} type="button" onClick={() => setActiveView('assistant')}>AI Assistant</button>
        </nav>
      </aside>

      <main className="content">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'applications' && renderApplicationsSection()}
        {activeView === 'documents' && renderDocumentsSection()}
        {activeView === 'validation' && renderValidationSection()}
        {activeView === 'assistant' && renderAssistantSection()}
      </main>
    </div>
  )
}

export default App
